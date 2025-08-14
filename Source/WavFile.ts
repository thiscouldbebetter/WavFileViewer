
namespace ThisCouldBeBetter.WavFileViewer
{

export class WavFile //
{
	filePath: string;
	samplingInfo: WavFileSamplingInfo;
	samplesForChannels: any; // number[][];

	byteConverter: ByteConverter;

	constructor
	(
		filePath: string,
		samplingInfo: WavFileSamplingInfo,
		samplesForChannels: number[][]
	)
	{
		this.filePath = filePath;
		this.samplingInfo = samplingInfo;
		this.samplesForChannels = samplesForChannels;

		 // hack
		if (this.samplingInfo == null)
		{
			this.samplingInfo = WavFileSamplingInfo.default();
		}

		if (this.samplesForChannels == null)
		{
			var numberOfChannels = this.samplingInfo.numberOfChannels;

			this.samplesForChannels = [];
			for (var c = 0; c < numberOfChannels; c++)
			{
				this.samplesForChannels[c] = [];
			}
		}

		this.byteConverter = new ByteConverter();
	}

	static fromName(name: string): WavFile
	{
		return new WavFile(name, null, null);
	}

	static fromFilePathSamplingInfoAndSamplesForChannels
	(
		filePath: string,
		samplingInfo: WavFileSamplingInfo,
		samplesForChannels: number[][]
	): WavFile
	{
		return new WavFile(filePath, samplingInfo, samplesForChannels);
	}

	static fromSamplingInfoAndSamplesForChannels
	(
		samplingInfo: WavFileSamplingInfo,
		samplesForChannels: number[][]
	): WavFile
	{
		return new WavFile(null, samplingInfo, samplesForChannels);
	}

	// constants

	static NumberOfBytesInRiffWaveAndFormatChunks = 36;

	// static methods

	appendClipFromWavFileBetweenTimesStartAndEnd
	(
		wavFileToClipFrom: WavFile,
		timeStartInSeconds: number,
		timeEndInSeconds: number
	): WavFile
	{
		var samplesPerSecond = wavFileToClipFrom.samplingInfo.samplesPerSecond;

		var timeStartInSamples = Math.floor
		(
			samplesPerSecond * timeStartInSeconds
		);

		var timeEndInSamples = Math.ceil
		(
			samplesPerSecond * timeEndInSeconds
		);

		// var samplesForChannelsInClip = [];

		for (var c = 0; c < wavFileToClipFrom.samplesForChannels.length; c++)
		{
			var samplesForChannelSource = wavFileToClipFrom.samplesForChannels[c];
			var samplesForChannelTarget = this.samplesForChannels[c];

			for (var s = timeStartInSamples; s <= timeEndInSamples; s++)
			{
				var sample = samplesForChannelSource[s];
				samplesForChannelTarget.push(sample);
			}
		}

		return this;
	}

	clipBetweenTimes(timeStartInSeconds: number, timeEndInSeconds: number): WavFile
	{
		var numberOfChannels = this.samplesForChannels.length;
		var samplesForChannels = [];
		for (var i = 0; i < numberOfChannels; i++)
		{
			samplesForChannels.push([]);
		}

		var clip = new WavFile
		(
			this.filePath + "-Clip",
			this.samplingInfo,
			samplesForChannels
		);

		clip.appendClipFromWavFileBetweenTimesStartAndEnd
		(
			this,
			timeStartInSeconds,
			timeEndInSeconds
		);

		return clip;
	}

	durationInSamples(): number
	{
		var returnValue = 0;
		if (this.samplesForChannels != null)
		{
			if (this.samplesForChannels.length > 0)
			{
				returnValue = this.samplesForChannels[0].length;
			}
		}

		return returnValue;
	}

	durationInSeconds(): number
	{
		var durationInSamples = this.durationInSamples();
		var returnValue =
			durationInSamples
			/ this.samplingInfo.samplesPerSecond;
		return returnValue;
	}

	extendOrTrimSamples(numberOfSamplesToExtendOrTrimTo: number): void
	{
		var numberOfChannels = this.samplingInfo.numberOfChannels;
		var samplesForChannelsNew = [];

		for (var c = 0; c < numberOfChannels; c++)
		{
			var samplesForChannelOld = this.samplesForChannels[c];
			var samplesForChannelNew = [];

			for (var s = 0; s < samplesForChannelOld.length && s < numberOfSamplesToExtendOrTrimTo; s++)
			{
				samplesForChannelNew[s] = samplesForChannelOld[s];
			}

			for (var s2 = samplesForChannelOld.length; s2 < numberOfSamplesToExtendOrTrimTo; s2++)
			{
				samplesForChannelNew[s2] = 0;
			}

			samplesForChannelsNew[c] = samplesForChannelNew;
		}

		this.samplesForChannels = samplesForChannelsNew;
	}

	// bytes

	// read

	static fromNameAndBytes(name: string, bytes: number[]): WavFile
	{
		var returnValue = WavFile.fromName(name);
		var reader = ByteStream.fromBytes(bytes);
		returnValue.fromBytes_Chunks(reader);
		return returnValue;
	}

	fromBytes_Chunks(reader: ByteStream): void
	{
		var converter = this.byteConverter;

		// var riffStringAsBytes = 
		reader.readBytes(4);

		// var numberOfBytesInFile =
		reader.readBytes(4);

		// var waveStringAsBytes =
		reader.readBytes(4);

		while (reader.hasMoreBytes() )
		{
			var chunkTypeAsString = converter.bytesToString(reader.readBytes(4) );

			if (chunkTypeAsString == "data")
			{
				this.fromBytes_Chunks_Data(reader);
			}
			else if (chunkTypeAsString == "fmt ")
			{
				this.fromBytes_Chunks_Format(reader);
			}
			else
			{
				this.fromBytes_Chunks_Unrecognized(reader);
			}
		}
	}

	fromBytes_Chunks_Data(reader: ByteStream): void
	{
		var converter = this.byteConverter;

		var subchunk2SizeInBytes = converter.bytesToIntegerUnsignedLE(reader.readBytes(4) );

		var samplesForChannelsMixedAsBytes = reader.readBytes(subchunk2SizeInBytes);

		var samplesForChannels = this.fromBytes_Chunks_Data_SamplesForChannels
		(
			this.samplingInfo,
			samplesForChannelsMixedAsBytes
		);

		this.samplesForChannels = samplesForChannels;
	}

	fromBytes_Chunks_Data_SamplesForChannels
	(
		samplingInfo: WavFileSamplingInfo,
		bytesToConvert: number[]
	): number[][]
	{
		var numberOfBytes = bytesToConvert.length;

		var numberOfChannels = samplingInfo.numberOfChannels;

		var returnSamples = [];

		var bytesPerSample = samplingInfo.bitsPerSample / ByteConverter.BitsPerByte;

		var samplesPerChannel =
			numberOfBytes
			/ bytesPerSample
			/ numberOfChannels;

		for (var c = 0; c < numberOfChannels; c++)
		{
			returnSamples[c] = [];
		}

		var b = 0;

		var byteConverter = this.byteConverter;
		var sampleValueAsBytes = [];

		for (var s = 0; s < samplesPerChannel; s++)
		{
			for (var c = 0; c < numberOfChannels; c++)
			{
				sampleValueAsBytes.length = 0;

				for (var i = 0; i < bytesPerSample; i++)
				{
					sampleValueAsBytes.push(bytesToConvert[b]);
					b++;
				}

				var sampleValueAsInteger = byteConverter.bytesToIntegerUnsignedLE
				(
					sampleValueAsBytes
				);

				returnSamples[c][s] = sampleValueAsInteger;
			}
		}

		return returnSamples;
	}

	fromBytes_Chunks_Format(reader: ByteStream): void
	{
		var converter = this.byteConverter;

		var chunkSizeInBytes = converter.bytesToIntegerUnsignedLE(reader.readBytes(4) );
		var formatCode = converter.bytesToIntegerUnsignedLE(reader.readBytes(2) );

		var numberOfChannels = converter.bytesToIntegerUnsignedLE(reader.readBytes(2) );
		var samplesPerSecond = converter.bytesToIntegerUnsignedLE(reader.readBytes(4) );

		// var bytesPerSecond =
		reader.readBytes(4); // samplesPerSecond * numberOfChannels * bitsPerSample / 8
		// var bytesPerSampleForAllChannels =
		reader.readBytes(2); // numberOfChannels * bitsPerSample / 8
		var bitsPerSample = converter.bytesToIntegerUnsignedLE(reader.readBytes(2) );

		var numberOfBytesInChunkSoFar = WavFileSamplingInfo.ChunkSizeInBytesMin;
		var numberOfExtraBytesInChunk =
			chunkSizeInBytes
			- numberOfBytesInChunkSoFar;

		var extraBytes = reader.readBytes(numberOfExtraBytesInChunk);

		var samplingInfo = new WavFileSamplingInfo
		(
			formatCode,
			numberOfChannels,
			samplesPerSecond,
			bitsPerSample,
			extraBytes
		);

		this.samplingInfo = samplingInfo;
	}

	fromBytes_Chunks_Unrecognized(reader: ByteStream): void
	{
		var converter = this.byteConverter;

		var chunkDataSizeInBytes = converter.bytesToIntegerUnsignedLE(reader.readBytes(4) );
		// var chunkData =
		reader.readBytes(chunkDataSizeInBytes);
	}

	// write

	toBytes(): number[]
	{
		var writer = new ByteStream([]);
		this.toBytes_Chunks(writer);
		return writer.bytes;
	}

	toBytes_Chunks(writer: ByteStream): void
	{
		var converter = this.byteConverter;

		writer.writeBytes(converter.stringToBytes("RIFF") );

		// hack
		var numberOfBytesOfOverhead =
			"RIFF".length
			+ "WAVE".length
			+ "fmt ".length
			+ 20 // additional bytes In format header
			+ "data".length;

			//+ 4; // additional bytes in data header?

		var numberOfBytesInFile =
			this.samplingInfo.numberOfChannels
			* this.samplesForChannels[0].length
			* this.samplingInfo.bitsPerSample
			/ ByteConverter.BitsPerByte
			+ numberOfBytesOfOverhead;

		writer.writeBytes(converter.integerUnsigned32BitToBytesLE(numberOfBytesInFile) );

		writer.writeBytes(converter.stringToBytes("WAVE") );

		this.toBytes_Chunks_Format(writer);
		this.toBytes_Chunks_Data(writer);
	}

	toBytes_Chunks_Data(writer: ByteStream): void
	{
		var converter = this.byteConverter;

		writer.writeBytes(converter.stringToBytes("data") );

		var samplesForChannelsMixedAsBytes =
			this.toBytes_Chunks_Data_SamplesForChannels
			(
				this.samplesForChannels,
				this.samplingInfo
			);

		writer.writeBytes(converter.integerUnsigned32BitToBytesLE(samplesForChannelsMixedAsBytes.length) );

		writer.writeBytes(samplesForChannelsMixedAsBytes);
	}

	toBytes_Chunks_Data_SamplesForChannels
	(
		samplesForChannelsToConvert: number[][],
		samplingInfo: WavFileSamplingInfo
	)
	{
		var returnBytes = null;

		var numberOfChannels = samplingInfo.numberOfChannels;

		var samplesPerChannel = samplesForChannelsToConvert[0].length;

		var bitsPerSample = samplingInfo.bitsPerSample;

		var bytesPerSample = bitsPerSample / ByteConverter.BitsPerByte;

		// var numberOfBytes = numberOfChannels * samplesPerChannel * bytesPerSample;

		returnBytes = [];

		var b = 0;

		var byteConverter = this.byteConverter;

		for (var s = 0; s < samplesPerChannel; s++)
		{
			for (var c = 0; c < numberOfChannels; c++)
			{
				var sampleAsInteger = samplesForChannelsToConvert[c][s];

				var sampleAsBytes = byteConverter.integerUnsignedToBytesLE
				(
					sampleAsInteger, bitsPerSample
				);

				for (var i = 0; i < bytesPerSample; i++)
				{
					returnBytes[b] = sampleAsBytes[i];
					b++;
				}
			}
		}

		return returnBytes;
	}

	toBytes_Chunks_Format(writer: ByteStream): void
	{
		var converter = this.byteConverter;

		writer.writeBytes(converter.stringToBytes("fmt ") );

		var samplingInfo = this.samplingInfo;

		writer.writeBytes(converter.integerUnsigned32BitToBytesLE(samplingInfo.chunkSizeInBytes() ) );
		writer.writeBytes(converter.integerUnsigned16BitToBytesLE(samplingInfo.formatCode ) );

		writer.writeBytes(converter.integerUnsigned16BitToBytesLE(samplingInfo.numberOfChannels) );
		writer.writeBytes(converter.integerUnsigned32BitToBytesLE(samplingInfo.samplesPerSecond) );

		writer.writeBytes(converter.integerUnsigned32BitToBytesLE(samplingInfo.bytesPerSecond() ) );
		writer.writeBytes(converter.integerUnsigned16BitToBytesLE(samplingInfo.bytesPerSampleForAllChannels() ) );
		writer.writeBytes(converter.integerUnsigned16BitToBytesLE(samplingInfo.bitsPerSample) );

		if (samplingInfo.extraBytes != null)
		{
			writer.writeBytes(samplingInfo.extraBytes);
		}
	}

	// JSON and Serialization.

	compressForSerialization(): void
	{
		var samplesForChannelsAsBytes = this.toBytes_Chunks_Data_SamplesForChannels
		(
			this.samplesForChannels, this.samplingInfo
		);

		var samplesForChannelsAsBase64 = Base64Encoder.bytesToStringBase64
		(
			samplesForChannelsAsBytes
		);

		this.samplesForChannels = samplesForChannelsAsBase64;
	}

	decompressAfterDeserialization(): void
	{
		var samplesForChannelsAsBase64 = this.samplesForChannels;
		var samplesForChannelsAsBytes = Base64Encoder.stringBase64ToBytes
		(
			samplesForChannelsAsBase64
		);

		var samplesForChannels = this.fromBytes_Chunks_Data_SamplesForChannels
		(
			this.samplingInfo,
			samplesForChannelsAsBytes
		);

		this.samplesForChannels = samplesForChannels;
	}

	static fromStringJSON(wavFileAsJSON: string): WavFile
	{
		var wavFile = JSON.parse(wavFileAsJSON);
		wavFile = WavFile.objectPrototypesSet(wavFile);
		return wavFile;
	}

	static objectPrototypesSet(wavFile: any): WavFile
	{
		Object.setPrototypeOf(wavFile, WavFile.prototype);

		Object.setPrototypeOf(wavFile.samplingInfo, WavFileSamplingInfo.prototype);

		// wavFile.decompressAfterDeserialization();

		return wavFile;
	}

	toStringJson(): string
	{
		var samplesForChannelsToRestore = this.samplesForChannels;

		this.compressForSerialization();

		var returnValue = JSON.stringify(this);
		this.samplesForChannels = samplesForChannelsToRestore;

		return returnValue;
	}

	// Drawing.

	toCanvasOfSizeInPixels(sizeInPixels: Coords): any
	{
		var d = document;
		var canvas = d.createElement("canvas");
		canvas.width = sizeInPixels.x;
		canvas.height = sizeInPixels.y;

		var g = canvas.getContext("2d");

		// Background.
		g.fillStyle = "White";
		g.fillRect(0, 0, sizeInPixels.x, sizeInPixels.y);

		// Border.
		g.strokeStyle = "Gray";
		g.strokeRect(0, 0, sizeInPixels.x, sizeInPixels.y);

		// Waveform.
		g.beginPath();
		g.moveTo(0, sizeInPixels.y / 2);
		var samples = this.samplesForChannels[0];
		var samplesCount = samples.length;
		var samplePosInPixels = Coords.fromXY(0, 0);
		var samplesNormalized = this.samplingInfo.samplesNormalize(samples);
		var sizeInPixelsHalfY = sizeInPixels.y / 2;

		for (var s = 0; s < samplesCount; s++)
		{
			var sampleNormalized = samplesNormalized[s];

			samplePosInPixels.x =
				s * sizeInPixels.x / samplesCount;
			samplePosInPixels.y =
				sizeInPixelsHalfY + sampleNormalized * sizeInPixelsHalfY
			g.lineTo(samplePosInPixels.x, samplePosInPixels.y);
		}
		g.stroke();

		// Midline.
		g.strokeStyle = "Black";
		g.beginPath();
		g.moveTo(0, sizeInPixelsHalfY);
		g.lineTo(sizeInPixels.x, sizeInPixelsHalfY);
		g.stroke();

		return canvas;
	}

	// Playing.

	domElementAudio: any;

	domElementAudioCreateTheCallCallback(callback: () => void): any
	{
		var soundAsBytes = this.toBytes();

		var soundAsStringBase64 =
			Base64Encoder.bytesToStringBase64(soundAsBytes);

		var soundAsDataUri =
			"data:audio/wav;base64," + soundAsStringBase64;

		var d = document;

		var domElementSoundSource =
			d.createElement("source");
		domElementSoundSource.src = soundAsDataUri;

		var domElementAudio = d.createElement("audio");
		domElementAudio.autoplay = true;
		var wavFile = this;
		domElementAudio.onended = () =>
		{
			wavFile.domElementAudioRemove();
			if (callback != null)
			{
				callback();
			}
		}

		this.domElementAudio = domElementAudio;
		domElementAudio.appendChild(domElementSoundSource);

		d.body.appendChild(domElementAudio);

		return this.domElementAudio;
	}

	domElementAudioRemove()
	{
		if (this.domElementAudio != null)
		{
			this.domElementAudio.parentElement.removeChild
			(
				this.domElementAudio
			);
			this.domElementAudio = null;
		}
	}

}

////////

export class WavFileSamplingInfo
{
	formatCode: number;
	numberOfChannels: number;
	samplesPerSecond: number;
	bitsPerSample: number;
	extraBytes: number[];

	constructor
	(
		formatCode: number,
		numberOfChannels: number,
		samplesPerSecond: number,
		bitsPerSample: number,
		extraBytes: number[]
	)
	{
		this.formatCode = (formatCode || WavFileSamplingInfo.FormatCodeDefault);
		this.numberOfChannels = numberOfChannels;
		this.samplesPerSecond = samplesPerSecond;
		this.bitsPerSample = bitsPerSample;
		this.extraBytes = (extraBytes || []);
	}

	// constants

	static ChunkSizeInBytesMin = 16;
	static FormatCodeDefault = 1; // Uncompressed.

	// static methods

	static default(): WavFileSamplingInfo
	{
		var returnValue = new WavFileSamplingInfo
		(
			1, // formatCode
			1, // numberOfChannels
			44100, // samplesPerSecond
			16, // bitsPerSample
			null // ?
		);

		return returnValue;
	}

	bytesPerSample(): number
	{
		return this.bitsPerSample / ByteConverter.BitsPerByte;
	}

	bytesPerSampleForAllChannels(): number
	{
		return this.bytesPerSample() * this.numberOfChannels;
	}

	bytesPerSecond(): number
	{
		return this.samplesPerSecond
			* this.bytesPerSampleForAllChannels();
	}

	chunkSizeInBytes(): number
	{
		return WavFileSamplingInfo.ChunkSizeInBytesMin + this.extraBytes.length;
	}

	samplesDenormalize(samplesToDenormalize: number[]): number[]
	{
		var sampleDenormalizedMax = Math.pow(2, this.bitsPerSample) - 1;
		var samplesDenormalized = [];
		for (var i = 0; i < samplesToDenormalize.length; i++)
		{
			var sampleToDenormalize = samplesToDenormalize[i];
			var sampleDenormalized = Math.round
			(
				(sampleToDenormalize + 1) / 2 * sampleDenormalizedMax
			);
			samplesDenormalized.push(sampleDenormalized);
		}

		if (this.bitsPerSample > 8)
		{
			samplesToDenormalize = samplesDenormalized;
			var sampleDenormalizedMaxHalf = Math.pow(2, this.bitsPerSample - 1);
			for (var i = 0; i < samplesToDenormalize.length; i++)
			{
				samplesToDenormalize[i] -= sampleDenormalizedMaxHalf;
			}
		}

		return samplesDenormalized;
	}

	samplesNormalize(samplesToNormalize: number[]): number[]
	{
		var sampleDenormalizedMax = Math.pow(2, this.bitsPerSample) - 1;
		var samplesNormalized = [];

		if (this.bitsPerSample > 8)
		{
			var sampleDenormalizedMaxHalf = Math.pow(2, this.bitsPerSample - 1);
			for (var i = 0; i < samplesToNormalize.length; i++)
			{
				var sampleToNormalize = samplesToNormalize[i];
				if (sampleToNormalize < sampleDenormalizedMaxHalf)
				{
					sampleToNormalize += sampleDenormalizedMaxHalf;
				}
				else
				{
					// Negative number.
					// todo - Two's complement?
					sampleToNormalize -= sampleDenormalizedMaxHalf;
				}
				samplesNormalized.push(sampleToNormalize);
			}
			samplesToNormalize = samplesNormalized;
			samplesNormalized = [];
		}

		for (var i = 0; i < samplesToNormalize.length; i++)
		{
			var sampleToNormalize = samplesToNormalize[i];
			var sampleNormalized = (sampleToNormalize / sampleDenormalizedMax) * 2 - 1;
			samplesNormalized.push(sampleNormalized);
		}
		return samplesNormalized;
	}
}

}