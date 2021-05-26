const form = $("form");
const inputs = $("input");

form.on("submit", (event) => {
    inputs.each((index, element) => {
        if (!$(element).val()) {
            event.preventDefault();
            $(element).addClass("required");
        }
    });
    if ($("#signature").length && !$("#signature").val()) {
        event.preventDefault();
        $("#signature-canvas").addClass("required");
    }
});
$("input").on("input", (event) => $(event.target).removeClass("required"));