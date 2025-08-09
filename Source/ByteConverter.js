"use strict";
var ThisCouldBeBetter;
(function (ThisCouldBeBetter) {
    var WavFileViewer;
    (function (WavFileViewer) {
        class ByteConverter {
            constructor(numberOfBits) {
                this.numberOfBits = numberOfBits;
                this.numberOfBytes = Math.floor(this.numberOfBits / 8);
                this.maxValueSigned =
                    (1 << (numberOfBits - 1)) - 1;
                this.maxValueUnsigned =
                    (1 << (numberOfBits));
            }
            bytesToFloat(bytes) {
                var bytesAsInteger = this.bytesToIntegerSignedBE(bytes); // Signed or unsigned?  BE or LE?
                var returnValue = this.integerToFloat(bytesAsInteger);
                return returnValue;
            }
            bytesToIntegerSignedBE(bytes) {
                // Big-endian.
                var returnValue = 0;
                var numberOfBytes = bytes.length;
                for (var i = 0; i < numberOfBytes; i++) {
                    var byte = bytes[numberOfBytes - i - 1];
                    returnValue |= byte << (i * WavFileViewer.Constants.BitsPerByte);
                }
                if (returnValue > this.maxValueSigned) {
                    returnValue -= this.maxValueUnsigned;
                }
                return returnValue;
            }
            bytesToIntegerSignedLE(bytes) {
                // Little-endian.
                var returnValue = 0;
                var numberOfBytes = bytes.length;
                for (var i = 0; i < numberOfBytes; i++) {
                    returnValue |= bytes[i] << (i * WavFileViewer.Constants.BitsPerByte);
                }
                if (returnValue > this.maxValueSigned) {
                    returnValue -= this.maxValueUnsigned;
                }
                return returnValue;
            }
            bytesToIntegerUnsignedBE(bytes) {
                // Big-endian.
                var returnValue = 0;
                var numberOfBytes = bytes.length;
                for (var i = 0; i < numberOfBytes; i++) {
                    var byte = bytes[numberOfBytes - i - 1];
                    returnValue |= byte << (i * WavFileViewer.Constants.BitsPerByte);
                }
                return returnValue;
            }
            bytesToIntegerUnsignedLE(bytes) {
                // Little-endian.
                var returnValue = 0;
                var numberOfBytes = bytes.length;
                for (var i = 0; i < numberOfBytes; i++) {
                    returnValue |= bytes[i] << (i * WavFileViewer.Constants.BitsPerByte);
                }
                return returnValue;
            }
            floatToInteger(float) {
                return float * this.maxValueSigned;
            }
            integerToBytesBE(integer) {
                // Big-endian.
                var returnValues = new Array();
                for (var i = 0; i < this.numberOfBytes; i++) {
                    var byteValue = (integer >> (WavFileViewer.Constants.BitsPerByte * i)) & 0xFF;
                    returnValues.splice(0, 0, byteValue);
                }
                return returnValues;
            }
            integerToBytesLE(integer) {
                // Little-endian.
                var returnValues = new Array();
                for (var i = 0; i < this.numberOfBytes; i++) {
                    var byteValue = (integer >> (WavFileViewer.Constants.BitsPerByte * i)) & 0xFF;
                    returnValues.push(byteValue);
                }
                return returnValues;
            }
            integerToFloat(integer) {
                var returnValue = integer / this.maxValueSigned;
                return returnValue;
            }
        }
        WavFileViewer.ByteConverter = ByteConverter;
    })(WavFileViewer = ThisCouldBeBetter.WavFileViewer || (ThisCouldBeBetter.WavFileViewer = {}));
})(ThisCouldBeBetter || (ThisCouldBeBetter = {}));
