"use strict";
var ThisCouldBeBetter;
(function (ThisCouldBeBetter) {
    var WavFileViewer;
    (function (WavFileViewer) {
        class SoundFromWavFile {
            constructor(name, sourceWavFile, offsetInSeconds) {
                this.name = name || "";
                this.offsetInSeconds = (offsetInSeconds || 0);
                this.sourceWavFile = sourceWavFile;
            }
            static fromNameWavFileAndOffsetInSeconds(name, sourceWavFile, offsetInSeconds) {
                return new SoundFromWavFile(name, sourceWavFile, offsetInSeconds);
            }
            static fromWavFile(wavFile) {
                return new SoundFromWavFile("", wavFile, null);
            }
            // instance methods
            durationInSeconds() {
                return this.sourceWavFile.durationInSeconds();
            }
            play() {
                this.playThenCallCallback(null);
            }
            playThenCallCallback(callback) {
                this.sourceWavFile.domElementAudioCreateThenCallCallback(callback);
            }
            stop() {
                this.sourceWavFile.domElementAudioRemove();
            }
        }
        WavFileViewer.SoundFromWavFile = SoundFromWavFile;
    })(WavFileViewer = ThisCouldBeBetter.WavFileViewer || (ThisCouldBeBetter.WavFileViewer = {}));
})(ThisCouldBeBetter || (ThisCouldBeBetter = {}));
