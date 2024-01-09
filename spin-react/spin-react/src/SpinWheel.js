import React, { useEffect, useState } from 'react';
import { SpinFunction } from './SpinFunction';
import { TweenMax } from 'gsap';

const SpinWheel = () => {
    const [wheelSpinning, setWheelSpinning] = useState(false);
    const [wheelPower, setWheelPower] = useState(0);

    const alertPrize = (indicatedSegment) => {
        alert(`You have won ${indicatedSegment.text}`);
        resetWheel();
    };

    const theWheel = new SpinFunction({
        'numSegments': 8,
        'outerRadius': 212,
        'textFontSize': 28,
        'segments': [
            { 'fillStyle': '#eae56f', 'text': 'Prize 1' },
            { 'fillStyle': '#89f26e', 'text': 'Prize 2' },
            { 'fillStyle': '#7de6ef', 'text': 'Prize 3' },
            { 'fillStyle': '#e7706f', 'text': 'Prize 4' },
            { 'fillStyle': '#eae56f', 'text': 'Prize 5' },
            { 'fillStyle': '#89f26e', 'text': 'Prize 6' },
            { 'fillStyle': '#7de6ef', 'text': 'Prize 7' },
            { 'fillStyle': '#e7706f', 'text': 'Prize 8' }
        ],
        'animation': {
            'type': 'spinToStop',
            'duration': 5,
            'spins': 8,
            'callbackFinished': alertPrize
        }
    });

    useEffect(() => {
        updateRemainingTime();
        const intervalId = setInterval(updateRemainingTime, 1000);

        return () => clearInterval(intervalId);
    }, []);

    const canSpinToday = () => {
        const lastSpinTime = localStorage.getItem('lastSpinTime');
        if (!lastSpinTime) return true;

        const oneDayInMillis = 10 * 1000;
        const currentTime = new Date().getTime();
        const lastSpinDate = new Date(parseInt(lastSpinTime));
        const timeSinceLastSpin = currentTime - lastSpinDate.getTime();

        return timeSinceLastSpin >= oneDayInMillis;
    };

    const updateRemainingTime = () => {
        const lastSpinTime = localStorage.getItem('lastSpinTime');
        const timeRemainingElement = document.getElementById('time_remaining');

        if (!lastSpinTime || canSpinToday()) {
            timeRemainingElement.style.display = 'none';
            return;
        }

        const oneDayInMillis = 10 * 1000;
        const currentTime = new Date().getTime();
        const lastSpinDate = new Date(parseInt(lastSpinTime));
        const timeSinceLastSpin = currentTime - lastSpinDate.getTime();

        const remainingTime = oneDayInMillis - timeSinceLastSpin;

        if (remainingTime > 0) {
            const remainingHours = Math.floor(remainingTime / (60 * 60 * 1000));
            const remainingMinutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
            const remainingSeconds = Math.floor((remainingTime % (60 * 1000)) / 1000);

            timeRemainingElement.innerHTML = `Next spin in: ${remainingHours}h ${remainingMinutes}m ${remainingSeconds}s`;
            timeRemainingElement.style.display = 'block';
        } else {
            timeRemainingElement.style.display = 'none';
        }
    };

    const trySpin = () => {
        if (canSpinToday()) {
            startSpin();
            localStorage.setItem('lastSpinTime', new Date().getTime());
            updateRemainingTime();
        } else {
            alert('You can spin only once per day!');
        }
    };

    const calculatePrize = () => {
        const angleRatios = [
            { angle: 90, ratio: 0.30 },
            { angle: 180, ratio: 0.30 },
            { angle: 270, ratio: 0.30 },
            { angle: 360, ratio: 0.10 }
        ];

        let randomValue = Math.random();
        let stopAt;

        for (const item of angleRatios) {
            if (randomValue < item.ratio) {
                stopAt = item.angle;
                break;
            } else {
                randomValue -= item.ratio;
            }
        }

        theWheel.animation.stopAngle = stopAt;
        theWheel.startAnimation();
    };

    const powerSelected = (powerLevel) => {
        if (!wheelSpinning) {
            document.getElementById('pw1').className = '';
            document.getElementById('pw2').className = '';
            document.getElementById('pw3').className = '';

            if (powerLevel >= 1) {
                document.getElementById('pw1').className = 'pw1';
            }

            if (powerLevel >= 2) {
                document.getElementById('pw2').className = 'pw2';
            }

            if (powerLevel >= 3) {
                document.getElementById('pw3').className = 'pw3';
            }

            setWheelPower(powerLevel);

            document.getElementById('spin_button').src = 'spin_on.png';
            document.getElementById('spin_button').className = 'clickable';
        }
    };

    const startSpin = () => {
        if (!wheelSpinning) {
            if (wheelPower === 1) {
                theWheel.animation.spins = 3;
            } else if (wheelPower === 2) {
                theWheel.animation.spins = 8;
            } else if (wheelPower === 3) {
                theWheel.animation.spins = 15;
            }

            document.getElementById('spin_button').src = 'spin_off.png';
            document.getElementById('spin_button').className = '';

            calculatePrize();
            theWheel.startAnimation();
            setWheelSpinning(true);
        }
    };

    const resetWheel = () => {
        theWheel.stopAnimation(false);
        theWheel.rotationAngle = 0;
        theWheel.draw();

        document.getElementById('pw1').className = '';
        document.getElementById('pw2').className = '';
        document.getElementById('pw3').className = '';

        setWheelSpinning(false);
    };

    return (
        <div align="center">
            <h1 style={{ color: '#ef6f6f' }}>Vòng quay may mắn</h1>
            <p>Mỗi ngày bạn sẽ có một lượt quay để kiếm về điểm thưởng.</p>

            <table cellPadding="0" cellSpacing="0" border="0">
                <tr>
                    <td>
                        <div className="power_controls">
                            <img id="spin_button" src="spin_off.png" alt="Spin" onClick={trySpin} />
                            <br /><br />
                            <div id="time_remaining" style={{ display: 'none' }}></div>
                        </div>
                    </td>
                    <td width="438" height="582" className="the_wheel" align="center" valign="center">
                        <canvas id="canvas" width="434" height="434">
                            <p style={{ color: 'white' }} align="center">Sorry, your browser doesn't support canvas. Please try another.</p>
                        </canvas>
                    </td>
                </tr>
            </table>
        </div>
    );
};

export default SpinWheel;
