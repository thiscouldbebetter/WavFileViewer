
namespace ThisCouldBeBetter.WavFileViewer
{

export class SoundFromWavFile implements Sound
{
	name: string;
	sourceWavFile: WavFile;
	offsetInSeconds: number;

	constructor
	(
		name: string, sourceWavFile: WavFile, offsetInSeconds: number
	)
	{
		this.name = name || "";
		this.offsetInSeconds = (offsetInSeconds || 0);
		this.sourceWavFile = sourceWavFile;
	}

	static fromNameWavFileAndOffsetInSeconds
	(
		name: string, sourceWavFile: WavFile, offsetInSeconds: number
	): SoundFromWavFile
	{
		return new SoundFromWavFile(name, sourceWavFile, offsetInSeconds);
	}

	static fromWavFile(wavFile: WavFile): Sound
	{
		return new SoundFromWavFile("", wavFile, null);
	}

	// instance methods

	durationInSeconds(): number
	{
		return this.sourceWavFile.durationInSeconds();
	}

	play(): void
	{
		this.playThenCallCallback(null);
	}

	playThenCallCallback(callback: () => void): void
	{
		this.sourceWavFile.domElementAudioCreateTheCallCallback(callback);
	}

	stop(): void
	{
		this.sourceWavFile.domElementAudioRemove();
	}
}

}