
namespace ThisCouldBeBetter.WavFileViewer
{

export class Coords
{
	x: number;
	y: number;

	constructor(x: number, y: number)
	{
		this.x = x;
		this.y = y;
	}

	static fromXY(x: number, y: number): Coords
	{
		return new Coords(x, y);
	}
}

}