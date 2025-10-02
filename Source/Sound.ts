
namespace ThisCouldBeBetter.WavFileViewer
{

export interface Sound
{
	domElement(): HTMLAudioElement;
	play(): void;
	playThenCallCallback(callback: () => void): void;
	stop(): void;
}

}