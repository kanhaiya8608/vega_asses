import {useEffect, useRef, useState} from 'react';
import {fabric} from 'fabric';

const ImageEditor = ({imageUrl}) => {
    const canvasRef = useRef(null);
    const [canvas, setCanvas] = useState(null);
    const [selectedObject, setSelectedObject] = useState(null);
    const [selectedColor, setSelectedColor] = useState('#fff');

    useEffect(() => {
        const initCanvas = new fabric.Canvas(canvasRef.current, {
            preserveObjectStacking: true,
        });

        fabric.Image.fromURL(imageUrl, (img) => {
            const ratio = img.width / img.height;
            let canvasWidth = window.innerWidth * 0.4; // Adjust width percentage as needed
            let canvasHeight = canvasWidth / ratio;

            // Adjust canvas size for smaller screens
            if (window.innerWidth <= 768) {
                canvasWidth = window.innerWidth * 0.8;
                canvasHeight = canvasWidth / ratio;
            } else if (window.innerWidth <= 1024) {
                canvasWidth = window.innerWidth * 0.6;
                canvasHeight = canvasWidth / ratio;
            }

            initCanvas.setWidth(canvasWidth);
            initCanvas.setHeight(canvasHeight);
            initCanvas.setBackgroundImage(img, initCanvas.renderAll.bind(initCanvas), {
                scaleX: canvasWidth / img.width,
                scaleY: canvasHeight / img.height,
            });
        });

        setCanvas(initCanvas);

        return () => {
            if (canvas) canvas.dispose();
        };
    }, [imageUrl]);

    const handleObjectSelection = (e) => {
        if (e.target) {
            setSelectedObject(e.target);
        } else {
            setSelectedObject(null);
        }
    };

    const handleColorSelection = (color) => {
        setSelectedColor(color);
        if (selectedObject) {
            selectedObject.set('fill', color);
            canvas.renderAll();
        }
    };

    const addText = () => {
        if (!canvas) return;

        const text = new fabric.Textbox('Enter text here', {
            left: 50,
            top: 50,
            width: 200,
            fontSize: 40,
            editable: true,
            selectable: true,
            fill: selectedColor,
        });
        canvas.add(text);
        handleObjectSelection({target: text});
        canvas.renderAll();
    };

    const addShape = (shapeType) => {
        if (!canvas) return;

        let newShape;
        switch (shapeType) {
            case 'circle':
                newShape = new fabric.Circle({radius: 50, fill: selectedColor, left: 100, top: 100, selectable: true});
                break;
            case 'rectangle':
                newShape = new fabric.Rect({
                    width: 100,
                    height: 50,
                    fill: selectedColor,
                    left: 150,
                    top: 150,
                    selectable: true
                });
                break;
            case 'triangle':
                newShape = new fabric.Triangle({
                    width: 100,
                    height: 100,
                    fill: selectedColor,
                    left: 200,
                    top: 200,
                    selectable: true
                });
                break;
            case 'polygon':
                newShape = new fabric.Polygon([{x: 50, y: 0}, {x: 100, y: 50}, {x: 50, y: 100}, {x: 0, y: 50}], {
                    fill: selectedColor,
                    left: 200,
                    top: 200,
                    selectable: true,
                });
                break;
            default:
                return;
        }
        canvas.add(newShape);
        handleObjectSelection({target: newShape});
        canvas.renderAll();
    };

    const downloadImage = () => {
        if (canvas) {
            canvas.discardActiveObject();
            canvas.renderAll();

            const svg = canvas.toSVG();

            const blob = new Blob([svg], {type: 'image/svg+xml'});
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'image.svg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleTextStyleChange = (property, value) => {
        if (selectedObject && selectedObject.type === 'textbox') {
            selectedObject.set(property, value);
            canvas.renderAll();
        }
    };

    useEffect(() => {
        if (!canvas) return;

        canvas.on('object:moving', (e) => {
            const obj = e.target;
            obj.setCoords();
        });
    }, [canvas]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-4 p-4">
            <div className="col-span-2 flex justify-center">
                <canvas ref={canvasRef} onClick={() => handleObjectSelection(null)} className="w-full h-auto border"/>
            </div>
            <div className="col-span-1 flex flex-col space-y-4">
                {selectedObject && selectedObject.type === 'textbox' && (
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Text Styles</h3>
                        <div>
                            <label className="block">Font Size:</label>
                            <input
                                type="number"
                                min="10"
                                max="100"
                                defaultValue="40"
                                onChange={(e) => handleTextStyleChange('fontSize', parseInt(e.target.value, 10))}
                                className="border p-1 w-full"
                            />
                        </div>
                        <div>
                            <label className="block">Font Family:</label>
                            <select onChange={(e) => handleTextStyleChange('fontFamily', e.target.value)}
                                    className="border p-1 w-full">
                                <option value="Arial">Arial</option>
                                <option value="Helvetica">Helvetica</option>
                                <option value="Times New Roman">Times New Roman</option>
                                <option value="Courier New">Courier New</option>
                                <option value="Verdana">Verdana</option>
                            </select>
                        </div>
                        <div>
                            <label className="block">Font Weight:</label>
                            <select onChange={(e) => handleTextStyleChange('fontWeight', e.target.value)}
                                    className="border p-1 w-full">
                                <option value="normal">Normal</option>
                                <option value="bold">Bold</option>
                                <option value="bolder">Bolder</option>
                                <option value="lighter">Lighter</option>
                            </select>
                        </div>
                        <div>
                            <label className="block">Text Align:</label>
                            <select onChange={(e) => handleTextStyleChange('textAlign', e.target.value)}
                                    className="border p-1 w-full">
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                                <option value="justify">Justify</option>
                            </select>
                        </div>
                    </div>
                )}
                <div>
                    <label className="block">Select Color:</label>
                    <input
                        type="color"
                        value={selectedColor}
                        onChange={(e) => handleColorSelection(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <button onClick={addText}
                            className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Add Text
                    </button>
                    <button onClick={() => addShape('circle')}
                            className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Add Circle
                    </button>
                    <button onClick={() => addShape('rectangle')}
                            className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Add Rectangle
                    </button>
                    <button onClick={() => addShape('triangle')}
                            className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Add Triangle
                    </button>
                    <button onClick={() => addShape('polygon')}
                            className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Add Polygon
                    </button>
                    <button onClick={downloadImage}
                            className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600">Download as SVG
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageEditor;
