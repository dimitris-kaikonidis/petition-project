const signersListContainer = $("#signers");
const signersList = $("#signers > ul");
const crowbar = $("#crowbar");

let offsetTop = signersList.offset().top;
let animation;

setTimeout(tickerAnimation, 5000);

signersListContainer.on("mouseenter", () => cancelAnimationFrame(animation));
signersListContainer.on("mouseleave", () => {
    cancelAnimationFrame(animation);
    setTimeout(() => {
        cancelAnimationFrame(animation);
        tickerAnimation();
    }, 5000);
});

document.getElementById("signers").addEventListener("wheel", (event) => {
    cancelAnimationFrame(animation);
    if (signersList.offset().top < 50 && event.deltaY < 0) {
        offsetTop = offsetTop + 5;
        signersList.css("top", `${offsetTop}px`);
    }
});

function tickerAnimation() {
    if (crowbar.offset().top < 300) {
        crowbar.css("visibility", "visible");
        signersListContainer.off("mouseover");
        return cancelAnimationFrame(animation);
    }
    offsetTop = offsetTop - 0.2;
    signersList.css("top", `${offsetTop}px`);
    animation = requestAnimationFrame(tickerAnimation);
}