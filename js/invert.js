const cursor = document.querySelector('.cursorInverted');

document.querySelectorAll('.cursor-zone').forEach(zone => {

    zone.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-active');
    });

    zone.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-active');
    });

});
let mouseX = 0;
let mouseY = 0;
let x = 0;
let y = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animate() {    
    x += (mouseX - x) * 0.15;
    y += (mouseY - y) * 0.15;

    cursor.style.transform =
        `translate(${x - 40}px, ${y - 40}px)`;

    requestAnimationFrame(animate);
}

animate();

document.querySelectorAll('.invert-hover').forEach(wrapper => {

    // If there's an img inside
    const img = wrapper.querySelector('img');

    if (img) {

        wrapper.style.setProperty(
            '--bg',
            `url(${img.src})`
        );

    } else {

        // Otherwise use the element's background image
        const bg =
            getComputedStyle(wrapper).backgroundImage;

        wrapper.style.setProperty('--bg', bg);
    }

    wrapper.addEventListener('mouseenter', e => {

    wrapper.classList.remove('active');

    const rect = wrapper.getBoundingClientRect();

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPercent = mouseX / rect.width * 100;
    const yPercent = mouseY / rect.height * 100;

    wrapper.style.setProperty('--x', `${xPercent}%`);
    wrapper.style.setProperty('--y', `${yPercent}%`);

    const radius = Math.max(
        Math.hypot(mouseX, mouseY),
        Math.hypot(rect.width - mouseX, mouseY),
        Math.hypot(mouseX, rect.height - mouseY),
        Math.hypot(rect.width - mouseX, rect.height - mouseY)
    );

    wrapper.style.setProperty('--radius', `${radius}px`);

    // Force the browser to apply the new position before animating
    wrapper.offsetWidth;

    wrapper.classList.add('active');
});

wrapper.addEventListener('mouseleave', () => {
    wrapper.classList.remove('active');
});

});

/* Glitch effect */
const glitchLayer =
document.querySelector(".glitch-layer");

let glitchTimeout;

let glitchRunning = false;

function createGlitch(){

    if(!glitchRunning) return;

    const slices =
   Math.floor(Math.random() * 8) + 8;

    let shadows=[];

    for(let i=0;i<slices;i++){

        const y=Math.random()*100;

        const h = Math.random() * .5 + .25;

        const x=Math.random()*70;

        const w=Math.random()*25+8;

        shadows.push(
        `linear-gradient(
        transparent ${y}%,
        white ${y}%,
        white ${y+h}%,
        transparent ${y+h}%)`);
    }

    glitchLayer.style.maskImage=
    shadows.join(",");

    glitchLayer.style.webkitMaskImage=
    shadows.join(",");

    const offset=
    (Math.random()-.5)*3;

    glitchLayer.style.transform=
    `translateX(${offset}px)`;

    if(Math.random()<.03){

        glitchLayer.style.filter=
        "invert(1) drop-shadow(2px 0 red) drop-shadow(-2px 0 cyan)";

    }else{

        glitchLayer.style.filter=
        "invert(1)";
    }

    setTimeout(()=>{

        glitchLayer.style.maskImage="none";
        glitchLayer.style.webkitMaskImage="none";
        glitchLayer.style.transform="translateX(0px)";

    },160);

    glitchTimeout=
    setTimeout(
    createGlitch,
    Math.random()*350+250);
}
    
function startGlitch(){

    if(glitchRunning) return;

    glitchRunning=true;

    createGlitch();

}

function stopGlitch(){

    glitchRunning=false;

    clearTimeout(glitchTimeout);

    glitchLayer.style.maskImage="none";
    glitchLayer.style.webkitMaskImage="none";
    glitchLayer.style.opacity=0;
    glitchLayer.style.transform="translateX(0px)";
}

startGlitch();

document.addEventListener("click",()=>{

    stopGlitch();

});