
interface ColorSelectorProps {
  colors: string[];
  selectedColor?: string;
  onChange: (color: string) => void;
  error?: boolean;
}
const COLOR_MAP: Record<string, string> = {
  Black: '#000000',
  White: '#FFFFFF',
  Gray: '#808080',
  Navy: '#000080',
  Beige: '#F5F5DC',
  Olive: '#556B2F', // DarkOliveGreen is nicer than standard Olive
  Brown: '#8B4513', // SaddleBrown stops it from looking 'red' like standard css 'brown'
  Red: '#FF0000',
};

export function ColorSelector({
  colors,
  selectedColor,
  onChange,
  error
}: ColorSelectorProps) {
  return (
    <div className="space-y-3">
      <span className="text-sm font-medium uppercase tracking-wide">Color</span>
      <div className="flex space-x-3">
        {colors.map((color) => {
          const mappedColor = COLOR_MAP[color] || color;
          return (
            <button
              key={color}
              onClick={() => onChange(color)}
              className={`
                  w-8 h-8 rounded-full border transition-all duration-200 relative
                  ${selectedColor === color ? 'ring-2 ring-offset-2 ring-black' : 'hover:scale-110'}
                  ${error ? 'ring-2 ring-offset-2 ring-red-500' : ''}
                `}
              style={{
                backgroundColor: mappedColor
              }}
              aria-label={`Select color ${color}`}>
            {/* Add a subtle border for white/light colors */}
            {['#FFFFFF', '#F5F5DC', '#F5F5F5'].includes(mappedColor) &&
              <span className="absolute inset-0 rounded-full border border-gray-200" />
            }
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-red-500">Please select a color</p>}
    </div>);

}
