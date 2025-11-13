// ==UserScript==
// @name         Youtube Speed Controller
// @version      2
// @description  Adds quick video speed controls to the video control bar
// @author       Duki
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const speeds = [0.5, 0.8 , 1, 1.15, 1.3, 1.5, 1.75, 2, 2.5, 3, 6, 10];

    const style = document.createElement('style');
    style.innerHTML = `
        #spdctrl {
            display: flex;
            flex-flow: row nowrap;
            align-items: center;
            gap: 5px;

            margin-right: 10px;

            .spd-btn {
                display:flex;
                flex-flow: column nowrap;
                justify-content: center;
                align-items: center;
                gap: 2px;

                height: 32px;
                width: 38px;

                cursor: pointer;
                border-radius: 4px;
                background-color: #0005;

                .spd-label, .spd-time {
                    display: block;
                    text-align: center;
                    line-height: 1;
                    color: #ddd;
                }

                .spd-time {
                    font-size: 0.75em;
                }
            }

            .spd-btn.spd-active {
                box-shadow: 0 0 0px 2px inset #0004, 0 0 0px 1px #fff3;
                background-color: #0004;
            }
        }
    `;
    document.head.appendChild(style);

    function setRate(n) {
        document.getElementsByClassName("html5-video-container")[ 0 ]
            .getElementsByClassName("video-stream html5-main-video")[ 0 ]
            .playbackRate = n;
    }

    function getRate() {
        return document.getElementsByClassName("html5-video-container")[ 0 ]
            .getElementsByClassName("video-stream html5-main-video")[ 0 ]
            .playbackRate;
    }

    function hasVideo() {
        return document.getElementsByClassName("ytp-right-controls").length != 0;
    }

    function injectController() {
        const controller = document.createElement('div');
        controller.id = 'spdctrl';

        const timeDisplay = document.getElementsByClassName("ytp-time-display")[0];
        timeDisplay.after(controller);

        addButtons();

        controller.addEventListener('click', (e) => {
            const btn = e.target.closest('.spd-btn');

            if (btn) {
                let speed = 1;

                if (!btn.classList.contains('spd-active')) {
                    speed = parseFloat(btn.querySelector('.spd-label').textContent);
                }

                btn.classList.toggle('spd-active');
                setRate(speed);
            }
        });
    }

    function updateButtons() {
        const currentRate = getRate();
        const buttons = document.querySelectorAll('#spdctrl .spd-btn');

        buttons.forEach(btn => {
            const speed = parseFloat(btn.querySelector('.spd-label').textContent);
            const timeElem = btn.querySelector('.spd-time');
            const video = document.getElementsByClassName("html5-video-container")[0]
                .getElementsByClassName("video-stream html5-main-video")[0];
            const duration = video.duration;
            const adjustedDuration = duration / speed;

            const formatedDuration = new Date(adjustedDuration * 1000).toISOString().slice(adjustedDuration >= 3600 ? 11 : 14, 19);

            timeElem.textContent = formatedDuration;

            if (speed === currentRate) {
                btn.classList.add('spd-active');
            } else {
                btn.classList.remove('spd-active');
            }
        });
    }

    function addButtons() {
        const controller = document.getElementById('spdctrl');

        speeds.forEach(speed => {
            const btn = document.createElement('div');
            btn.classList.add('spd-btn');

            const label = document.createElement('span');
            label.classList.add('spd-label');
            label.textContent = speed + 'x';

            const time = document.createElement('span');
            time.classList.add('spd-time');

            btn.appendChild(label);
            btn.appendChild(time);

            controller.appendChild(btn);
        });
    }


    window.setInterval(function () {
        const controller = document.getElementById('spdctrl');

        if (controller) {
            updateButtons();
        }
        else if (controller === null && hasVideo()) {
            injectController();
        }
    }, 1000);

})();