export function setupFormToggle({
    buttonSelector,
    panelSelector,
    openText,
    closeText,
}) {
    const toggleButton = document.querySelector(buttonSelector);
    const formPanel = document.querySelector(panelSelector);

    function toggleForm() {
        formPanel.classList.toggle("hidden");

        const formIsHidden = formPanel.classList.contains("hidden");

        if (formIsHidden) {
            toggleButton.textContent = openText;
        } else {
            toggleButton.textContent = closeText;
        }
    }

    toggleButton.addEventListener("click", toggleForm);
}