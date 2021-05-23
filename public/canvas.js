const signatureVal = $("#signature");
const signature = $("#signature-canvas");
const ctx = signature[0].getContext("2d");
const clearButton = $("#clear-button");

ctx.lineWidth = "3";
ctx.strokeStyle = "black";

let draw = false;
let mouseCoords;
let prevCoords = mouseCoords;

signature.on("mousedown", event => {
    draw = true;
    prevCoords = {
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
        sign();
    }
});

signature.on("mouseup", () => {
    draw = false;
    signatureVal.val(signature[0].toDataURL());
});

clearButton.on("mouseup", () => ctx.clearRect(0, 0, signature.width(), signature.height()));

function sign() {
    ctx.beginPath();
    ctx.moveTo(prevCoords.x, prevCoords.y);
    ctx.lineTo(mouseCoords.x, mouseCoords.y);
    ctx.stroke();
    prevCoords = mouseCoords;
}

