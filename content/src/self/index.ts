import "source-map-support/register";
import {createCanvas} from "canvas";
import {base64Encode} from "./util/base64";
import axios, {AxiosRequestConfig} from "axios";
import {point, showText} from "../canvas-lib/coordinate-grid-canvas/objects";
import {setupCoordinateGridCanvas} from "../canvas-lib/coordinate-grid-canvas/setupCoordinateGridCanvas";

async function updateImage(imageId: number, width: number, height: number, renderer: (context: CanvasRenderingContext2D) => void) {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d");
    renderer(context as any);
    const request = {
        contentType: "image/png",
        dataBase64: base64Encode(canvas.toBuffer("image/png")),
    };
    const config: AxiosRequestConfig = {
        headers: {
            Authorization: "Bearer 1",
        },
    };
    const response = await axios.put(`http://localhost:8080/author/updateImage/${imageId}`, request, config);
    if (response.status !== 200) {
        throw new Error(`got unexpected status code ${response.status}`);
    }
}

async function main() {
    /*
    await updateImage(2, 200, 200, (context) => {
        setupCoordinateGridCanvas(context, -6, 6, -6, 6);

        context.strokeStyle = "blue";
        context.lineWidth = 0.07;
        context.setLineDash([0.2, 0.2]);
        infiniteLine(context, 1, 1, 2, 3);

        context.strokeStyle = "green";
        context.fillStyle = "green";
        context.lineWidth = 0.07;
        context.setLineDash([]);
        showXAxisAngle(context, 1, 1, 2, 3);

        context.strokeStyle = "red";
        context.lineWidth = 0.1;
        context.setLineDash([]);
        arrow(context, 1, 1, 2, 3);

        context.fillStyle = "black";
        point(context, 2, 3);
    });
    */
    await updateImage(9, 200, 200, (context) => {
        setupCoordinateGridCanvas(context, -0.6, 6, -0.6, 6, { clipNegative: true });
    });
    await updateImage(10, 200, 200, (context) => {
        setupCoordinateGridCanvas(context, -0.6, 6, -0.6, 6, { clipNegative: true });
        context.fillStyle = "black";
        point(context, 1, 3);
    });
    await updateImage(11, 200, 200, (context) => {
        setupCoordinateGridCanvas(context, -0.6, 6, -0.6, 6, { clipNegative: true });
        context.fillStyle = "black";
        point(context, 1, 3, "(1|3)");
    });
    await updateImage(12, 200, 200, (context) => {
        setupCoordinateGridCanvas(context, -0.6, 6, -0.6, 6, { clipNegative: true });
        context.fillStyle = "black";
        const pointOptions = { font: "0.5px sans-serif", labelX: 0.2, labelY: 0.5 };
        point(context, 1, 2, "(1|2)", pointOptions);
        point(context, 5, 2, "(5|2)", pointOptions);

        context.strokeStyle = "black";
        context.lineWidth = 0.07;
        context.setLineDash([0.1, 0.1]);
        context.beginPath();
        context.moveTo(1, 2);
        context.lineTo(5, 2);
        context.stroke();

        context.font = "0.4px sans-serif";
        showText(context, 2, 2.1, "Abstand: 4");

    });
    await updateImage(13, 200, 200, (context) => {
        setupCoordinateGridCanvas(context, -0.6, 6, -0.6, 6, { clipNegative: true });
        context.fillStyle = "black";
        const pointOptions = { font: "0.5px sans-serif", labelX: 0.2, labelY: 0.5 };
        point(context, 1, 2, "(1|2)", pointOptions);
        point(context, 1, 4, "(1|4)", pointOptions);

        context.strokeStyle = "black";
        context.lineWidth = 0.07;
        context.setLineDash([0.1, 0.1]);
        context.beginPath();
        context.moveTo(1, 4);
        context.lineTo(1, 2);
        context.stroke();

        context.font = "0.4px sans-serif";
        showText(context, 1.1, 2.8, "Abstand: 2");

    });
}

main().then(() => {});
