const signersListContainer = $("#signers");
const signersList = $("#signers > ul");
const signersListItems = $("#signers > ul > li");
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
    if (event.deltaY < 0) {
        offsetTop = offsetTop + 5;
        signersList.css("top", `${offsetTop}px`);
    } else {
        offsetTop = offsetTop - 5;
        signersList.css("top", `${offsetTop}px`);
    }
    visible();
});

function tickerAnimation() {
    if (crowbar.offset().top < 300) {
        crowbar.removeClass("off");
        signersListContainer.off("mouseover");
        return cancelAnimationFrame(animation);
    }
    visible();
    offsetTop = offsetTop - 0.2;
    signersList.css("top", `${offsetTop}px`);
    animation = requestAnimationFrame(tickerAnimation);
}

function visible() {
    $.each(signersListItems, (index, item) =>
        $(item).toggleClass("off", $(item).offset().top > 350));
}