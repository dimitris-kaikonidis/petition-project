const clearButton = $("#clear-button");
const signature = $("#signature-canvas");
const ctx = signature[0].getContext("2d");

ctx.lineWidth = "5";
ctx.strokeStyle = "black";

let draw = false;
let mouseCoords;

signature.on("mousedown", event => {
    draw = true;
    mouseCoords = {
        x: event.pageX - signature.offset().left,
        y: event.pageY - signature.offset().top
    };
});

signature.on("mousemove", event => {
    if (draw) {
        mouseCoords = {
            x: event.pageX - signature.offset().left,
            y: event.pageY - signature.offset().top
        };
        sign(mouseCoords);
    }
});

signature.on("mouseup", () => {
    draw = false;
});

clearButton.on("mouseup", () => ctx.clearRect(0, 0, signature.width(), signature.height()));

function sign(prevPos) {
    ctx.beginPath();
    ctx.moveTo(prevPos.x, prevPos.y);
    ctx.lineTo(prevPos.x + 1, prevPos.y + 1);
    ctx.stroke();
}
