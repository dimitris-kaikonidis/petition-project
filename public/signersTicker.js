const signersListContainer = $("#signers");
const signersList = $("#signers > ul");
const crowbar = $("#crowbar");

let offsetTop = signersList.offset().top;
let animation;

tickerAnimation();

signersListContainer.on("mouseover", () => cancelAnimationFrame(animation));
signersListContainer.on("mouseout", () => tickerAnimation());

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