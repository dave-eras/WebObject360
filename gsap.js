// Function to animate a group of elements
function animateGroup(selector) {
    const group = document.querySelectorAll(selector);
    if (!group.length) {
        console.warn(`No elements found for selector: ${selector}`);
        return;
    }

    group.forEach(el => el.style.opacity = 1);
  
    gsap.fromTo(group,
        { x: "490%", opacity: 0, scale: 0.95 },  // Start off-screen to the right using percentage
        { x: "427%", opacity: 1, scale: 1, duration: 1, ease: "power2.out" }  // Slide to natural position
    );
}
  