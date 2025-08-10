"use strict";
var ThisCouldBeBetter;
(function (ThisCouldBeBetter) {
    var WavFileViewer;
    (function (WavFileViewer) {
        class UiEventHandler {
            static buttonPlay_Clicked() {
                if (this.soundLoaded == null) {
                    alert("No file loaded!");
                }
                else {
                    this.soundLoaded.play();
                }
            }
            static inputFile_Changed(inputFile) {
                var file = inputFile.files[0];
                if (file != null) {
                    var fileReader = new FileReader();
                    fileReader.onload = (event) => {
                        var fileContentsAsBinaryString = event.target.result;
                        var fileContentsAsBytes = fileContentsAsBinaryString
                            .split("")
                            .map((x) => x.charCodeAt(0));
                        var wavFileLoaded = WavFileViewer.WavFile.fromNameAndBytes(file.name, fileContentsAsBytes);
                        var d = document;
                        var inputImageSizeInPixelsX = d.getElementById("inputImageSizeInPixelsX");
                        var inputImageSizeInPixelsY = d.getElementById("inputImageSizeInPixelsY");
                        var imageSizeInPixelsX = parseInt(inputImageSizeInPixelsX.value);
                        var imageSizeInPixelsY = parseInt(inputImageSizeInPixelsY.value);
                        var imageSizeInPixels = WavFileViewer.Coords.fromXY(imageSizeInPixelsX, imageSizeInPixelsY);
                        var fileAsWaveformImage = wavFileLoaded.toCanvasOfSizeInPixels(imageSizeInPixels);
                        var divImage = d.getElementById("divImage");
                        divImage.innerHTML = "";
                        divImage.appendChild(fileAsWaveformImage);
                        UiEventHandler.soundLoaded =
                            WavFileViewer.SoundFromWavFile.fromWavFile(wavFileLoaded);
                    };
                    fileReader.readAsBinaryString(file);
                }
            }
        }
        WavFileViewer.UiEventHandler = UiEventHandler;
    })(WavFileViewer = ThisCouldBeBetter.WavFileViewer || (ThisCouldBeBetter.WavFileViewer = {}));
})(ThisCouldBeBetter || (ThisCouldBeBetter = {}));
var UiEventHandler = ThisCouldBeBetter.WavFileViewer.UiEventHandler;
