'use strict';

window.onload = () => {

	const ajax = new XMLHttpRequest();
	const hero = document.getElementById('hero');

	const width = hero.clientWidth;
	const height = hero.clientHeight;
	const rotation = Math.random() * 360;

	ajax.open('GET', './brush.svg', true);
	ajax.send();
	ajax.onload = () => {
		// Style the stroke
		const stroke = document.createElement('div');
		stroke.className = 'stroke';
		stroke.style.transform = `translate(-50%,-50%) rotate(${rotation}deg)`;

		const fragments = {};

		// Calculate total number of brush stroke fragments
		const fragLength = getFragLength();
		const maxLength = getMaxLength(width, height, rotation);
		let fragTotal = Math.floor(maxLength * 3 / fragLength);

		// Calculate segment number
		const maxDis = (fragLength * fragTotal - maxLength) / 2;
		const segNum = (fragTotal - 1)/2;

		for (let idx = 0; idx < fragTotal; idx++) {
			const fragment = document.createElement('div');
			fragment.className = 'fragment';
			fragment.id = `fragment-${idx}`;
			fragment.innerHTML = ajax.responseText;

			const initialY = getInitialY(maxDis, fragLength, idx);
			const targetY = getTargetY(maxDis, segNum, idx);

			// Store individual fragment settings to fragments object
			fragments[idx] = { div: fragment, initialY, currentY: initialY, targetY, deltaY: 0 };

			// Append individual fragment to a stroke
			fragment.style.transform = `translateY(${initialY}px)`;
			stroke.appendChild(fragment);
		}

		hero.appendChild(stroke);

		animate(fragments, maxLength/fragLength, maxLength/fragLength * 50);
		// animate(fragments, 5, 200);
	};

	// Animate, 100ms default timeout, 1s default duration
	const animate = (fragments, timeout = 100, duration = 1000) => {
		let totalSteps = Math.round(duration / timeout);
		for (const idx in fragments) {
			if (fragments.hasOwnProperty(idx)) {
				fragments[idx].deltaY = (fragments[idx].targetY - fragments[idx].initialY) / totalSteps;
			}
		}

		const timer = setInterval(() => {
			if (totalSteps <= 0) {
				clearInterval(timer);
			}

			for (const idx in fragments) {
				if (fragments.hasOwnProperty(idx)) {
					fragments[idx].currentY += fragments[idx].deltaY;
					fragments[idx].div.style.transform = `translateY(${fragments[idx].currentY}px)`;
				}
			}

			totalSteps--;
		}, timeout);
	};

	// Get individual brush stroke fragment length
	const getFragLength = () => {
		const fragment = document.createElement('div');
		fragment.className = 'fragment';
		fragment.innerHTML = ajax.responseText;
		const svg = fragment.querySelector(`.fragment svg`);

		return svg.getAttribute('height');
	};

	// Calculate maximum available brush stroke runway length
	// for given canvas width and height and brush stroke rotation degree
	const getMaxLength = (width, height, rotation) => {
		let rot = Math.abs(rotation) % 360;

		if (rot > 90 && rot <= 180) {
			rot = 180 - rot;
		} else if (rot > 180 && rot <= 270) {
			rot = rot - 180;
		} else if (rot > 270 && rot < 360) {
			rot = 360 - rot;
		}

		const threshDeg = Math.atan(width/height) * 180/Math.PI;
		let length;

		if (rot < threshDeg) {
			length = height / Math.cos(rot * Math.PI/180);
		} else {
			length = width / Math.sin(rot * Math.PI/180);
		}

		return length * 0.90;
	};

	// Calculate init translateY distance
	const getInitialY = (maxDis, fragLength, idx) => maxDis - fragLength * idx;

	// Calculate target translateY distance
	const getTargetY = (maxDis, segNum, idx) => maxDis * (segNum - idx) / segNum;
}
