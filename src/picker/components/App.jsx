import React, { Component, createRef } from 'react';
import autobind from 'autobind-decorator';
import { remote } from 'electron';
import { exec } from 'child_process';
import libpath from 'path';
import fs from 'fs-extra';
import { PNG } from 'pngjs';
import Color from 'color';
import { pickerWidth, pickerHeight } from './App.json';
import './App.scss';

const { app } = remote.require('electron');
const manager = remote.require('./');
const tmpdirname = libpath.join(app.getAppPath(), '_tmp_');
let capturedPath = libpath.join(tmpdirname, `${Date.now()}.png`);
const WIDTH = 7;
const RATIO = 10;
const DY = 24;

fs.removeSync(tmpdirname);
fs.mkdirSync(tmpdirname);

/**
 *
 * @param {string} path
 */
const pathToPixels = async (path) => {
	return new Promise((resolve) => {
		fs
			.createReadStream(path)
			.pipe(new PNG({ filterType: 4 }))
			.on('parsed', (data) => {
				resolve(data);
			});
	});
};

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

	componentDidMount() {
		this._screen_();
	}

	@autobind
	async _screen_() {
		return (async () => {
			const {
				state: { screenX, screenY },
				$canvas: { current: $canvas }
			} = this;
			const half = Math.floor(WIDTH / 2);

			capturedPath = libpath.join(tmpdirname, `${Date.now()}.png`);

			await new Promise((resolve) => {
				exec(
					`screencapture -x -R ${screenX - half},${screenY -
						half},${WIDTH},${WIDTH} ${capturedPath}`,
					() => {
						resolve();
					}
				);
			});

			const width = RATIO * WIDTH;
			const capturedWidth = WIDTH * 2;
			const context = $canvas.getContext('2d');
			const imageData = context.getImageData(0, 0, width, width);
			const { data: dst } = imageData;
			const data = await pathToPixels(capturedPath);

			for (let i = 0; i < capturedWidth; i += 1) {
				for (let j = 0; j < capturedWidth; j += 1) {
					const index = 4 * (i + j * capturedWidth);
					const r = data[index];
					const g = data[index + 1];
					const b = data[index + 2];

					for (let n = 0; n < RATIO; n += 1) {
						for (let m = 0; m < RATIO; m += 1) {
							const target =
								4 * (i * RATIO + n + (j * RATIO + m) * width);

							dst[target] = r;
							dst[target + 1] = g;
							dst[target + 2] = b;
							dst[target + 3] = 255;
						}
					}
				}
			}

			context.putImageData(imageData, 0, 0);

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

			await fs.unlink(capturedPath);

			const { data: [r, g, b] } = context.getImageData(cx, cy, 1, 1);

			this.setState({ color: Color({ r, g, b }).hex() }, () => {
				setTimeout(this._screen_, 1);
			});
		})().catch((err) => {
			console.error(err);
			setTimeout(this._screen_, 1);
		});
	}

	/**
	 * @param {KeyboardEvent} e
	 */
	@autobind
	onKeyDown(e) {
		const { keyCode } = e;

		if (keyCode === 27) {
			manager.get('picker').hide();
		}
	}

	@autobind
	onClick() {
		const { state: { color } } = this;

		manager.get('picker').hide();

		const { webContents } = manager.get('main');

		webContents.send('post/color', { color });
	}

	/**
	 * @param {MouseEvent} e
	 */
	@autobind
	onMouseMove(e) {
		const { clientX, clientY } = e;
		const screenX = clientX;
		const screenY = clientY + DY;

		this.setState({
			screenX,
			screenY,
			mouseX: clientX,
			mouseY: clientY
		});
	}

	render() {
		const { state: { mouseX, mouseY, color } } = this;

		return (
			<div styleName='base'>
				<div
					styleName='picker'
					C
					style={{
						left:
							mouseX < innerWidth / 2
								? mouseX + 10
								: mouseX - 5 - pickerWidth,
						top:
							mouseY < innerHeight / 2
								? mouseY + 10
								: mouseY - 5 - pickerHeight
					}}
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
