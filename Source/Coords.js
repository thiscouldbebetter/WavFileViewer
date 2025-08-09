"use strict";
var ThisCouldBeBetter;
(function (ThisCouldBeBetter) {
    var WavFileViewer;
    (function (WavFileViewer) {
        class Coords {
            constructor(x, y) {
                this.x = x;
                this.y = y;
            }
            static fromXY(x, y) {
                return new Coords(x, y);
            }
        }
        WavFileViewer.Coords = Coords;
    })(WavFileViewer = ThisCouldBeBetter.WavFileViewer || (ThisCouldBeBetter.WavFileViewer = {}));
})(ThisCouldBeBetter || (ThisCouldBeBetter = {}));
