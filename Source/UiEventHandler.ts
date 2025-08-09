
namespace ThisCouldBeBetter.WavFileViewer
{

export class UiEventHandler
{
	static inputFile_Changed(inputFile: any): void
	{
		var file = inputFile.files[0];
		if (file != null)
		{
			var fileReader = new FileReader();
			fileReader.onload = (event) =>
			{
				var fileContentsAsBinaryString: any = event.target.result;
				var fileContentsAsBytes =
					fileContentsAsBinaryString
						.split("")
						.map( (x: string) => x.charCodeAt(0) );

				var fileAsWavFile =
					WavFile.fromNameAndBytes(file.name, fileContentsAsBytes);

				var d = document;

				var inputImageSizeInPixelsX: any =
					d.getElementById("inputImageSizeInPixelsX");
				var inputImageSizeInPixelsY: any =
					d.getElementById("inputImageSizeInPixelsY");

				var imageSizeInPixelsX = parseInt(inputImageSizeInPixelsX.value);
				var imageSizeInPixelsY = parseInt(inputImageSizeInPixelsY.value);

				var imageSizeInPixels =
					Coords.fromXY(imageSizeInPixelsX, imageSizeInPixelsY);

				var fileAsWaveformImage =
					fileAsWavFile.toCanvasOfSizeInPixels(imageSizeInPixels);

				var divImage = d.getElementById("divImage");
				divImage.innerHTML = "";
				divImage.appendChild(fileAsWaveformImage);
			}
			fileReader.readAsBinaryString(file);
		}
	}
}

}

import UiEventHandler = ThisCouldBeBetter.WavFileViewer.UiEventHandler;