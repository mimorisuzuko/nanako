import React, { Component, createRef } from 'react';
import autobind from 'autobind-decorator';
import { remote, ipcRenderer } from 'electron';
import './App.scss';

const robot = remote.require('robotjs');
const WIDTH = 7;
const RATIO = 10;
const DY = 24;

export default class App extends Component {
	constructor() {
		super();

		this.$canvas = createRef();
		this.state = {
			screenX: 0,
			screenY: 0,
			mouseX: 0,
			mouseY: 0,
			color: '#000000'
		};

		window.addEventListener('mousemove', this.onMouseMove);
		window.addEventListener('click', this.onClick);
		window.addEventListener('keydown', this.onKeyDown);
	}

	@autobind
	onKeyDown() {
		ipcRenderer.send('picker:hide');
	}

	@autobind
	onClick() {
		const { state: { color } } = this;

		ipcRenderer.send('picker:post/color', { color });
	}

	/**
	 * @param {MouseEvent} e
	 */
	@autobind
	onMouseMove(e) {
		const { clientX, clientY } = e;
		const { $canvas: { current: $canvas } } = this;
		const context = $canvas.getContext('2d');
		const half = Math.floor(WIDTH / 2);
		const screenX = clientX;
		const screenY = clientY + DY;
		let color = '#000000';

		for (let i = 0; i < WIDTH; i += 1) {
			for (let j = 0; j < WIDTH; j += 1) {
				const x = screenX + i - half;
				const y = screenY + j - half;
				const fill =
					x < innerWidth && y < innerHeight
						? `#${robot.getPixelColor(x, y)}`
						: '#000000';

				if (x === screenX && y === screenY) {
					color = fill;
				}

				context.fillStyle = fill;
				context.fillRect(i * RATIO, j * RATIO, RATIO, RATIO);
			}
		}

		const cx = half * RATIO;
		const cy = half * RATIO;

		context.fillStyle = 'black';
		context.fillRect(cx - 1, cy - 1, RATIO + 2, 1);
		context.fillRect(cx - 1, cy - 1, 1, RATIO + 2);
		context.fillRect(cx - 1, cy - 1 + RATIO + 1, RATIO + 2, 1);
		context.fillRect(cx - 1 + RATIO + 1, cy - 1, 1, RATIO + 2);
		context.fillStyle = 'white';
		context.fillRect(cx - 2, cy - 2, RATIO + 4, 1);
		context.fillRect(cx - 2, cy - 2, 1, RATIO + 4);
		context.fillRect(cx - 2, cy + RATIO + 1, RATIO + 4, 1);
		context.fillRect(cx + RATIO + 1, cy - 2, 1, RATIO + 4);

		this.setState({
			screenX,
			screenY,
			mouseX: clientX,
			mouseY: clientY,
			color
		});
	}

	render() {
		const { state: { mouseX, mouseY, color } } = this;

		return (
			<div styleName='base'>
				<div
					styleName='picker'
					style={{ left: mouseX + 10, top: mouseY + 10 }}
				>
					<div styleName='colorcode'>{color}</div>
					<canvas
						ref={this.$canvas}
						width={WIDTH * RATIO}
						height={WIDTH * RATIO}
					/>
				</div>
			</div>
		);
	}
}
