public abstract class Shape : IDrawable
{
  public Color MyColor { get; private set; }
  public abstract void Draw();
}
public class Circle : Shape
{
  public Point Center { get; private set; }
  public int Radius { get; private set; }
  public override void Draw()
  {
    // draw...
  }
}
public interface IDrawable
{
  void Draw();
}
