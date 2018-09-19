import React, { Component } from 'react';
import autobind from 'autobind-decorator';
import Color from 'color';
import fs from 'fs-extra';
import os from 'os';
import libpath from 'path';
import _ from 'lodash';
import { ColorState } from '../models';
import { List } from 'immutable';
import ColorItem from './ColorItem';
import { ToastContainer, toast } from 'react-toastify';
import './App.scss';

const filename = libpath.join(os.homedir(), '.nanako');

if (!fs.existsSync(filename)) {
	fs.writeFileSync(filename, JSON.stringify([]), { encoding: 'utf-8' });
}

const nanakoState = List(
	_.map(JSON.parse(fs.readFileSync(filename)), (a) => {
		return new ColorState(a);
	})
);

export default class App extends Component {
	constructor() {
		super();

		this.state = {
			nanakoState,
			tmpName: '',
			tmpColor: ''
		};
	}

	saveState(newState, rest = {}) {
		fs.writeFileSync(filename, JSON.stringify(newState.toJS()), {
			encoding: 'utf-8'
		});
		this.setState({ nanakoState: newState, ...rest });
	}

	/**
	 * @param {number} index
	 * @param {{ key: string, value: string }} changed
	 */
	@autobind
	onChangeColorState(index, changed) {
		const { key, value } = changed;
		const { state: { nanakoState } } = this;
		const newState = nanakoState.update(index, (color) =>
			color.set(key, value)
		);

		this.saveState(newState);
	}

	@autobind
	addColor() {
		const { state: { tmpColor, tmpName, nanakoState } } = this;
		if (tmpName === '' || tmpColor === '') {
			toast.error('Name and Color are required', {
				position: toast.POSITION.BOTTOM_RIGHT
			});
		} else {
			try {
				const newState = nanakoState.push(
					new ColorState({
						name: tmpName,
						color: Color(tmpColor).hex()
					})
				);

				this.saveState(newState, { tmpColor: '', tmpName: '' });
			} catch (err) {
				const { message } = err;

				if (
					_.some([/^Unable to parse color from string: .+/], (a) =>
						a.test(message)
					)
				) {
					toast.error(message, {
						position: toast.POSITION.BOTTOM_RIGHT
					});
				} else {
					console.error(err);
				}
			}
		}
	}

	/**
	 * @param {number} index
	 */
	@autobind
	deleteColor(index) {
		const { state: { nanakoState } } = this;
		const newState = nanakoState.filter((a, i) => i !== index);

		this.saveState(newState);
		this.setState({ nanakoState: newState });
	}

	/**
	 * @param {Event} e
	 */
	@autobind
	onChangeTmpName(e) {
		const { currentTarget: { value } } = e;

		this.setState({ tmpName: value });
	}

	/**
	 * @param {Event} e
	 */
	@autobind
	onChangeTmpColor(e) {
		const { currentTarget: { value } } = e;

		this.setState({ tmpColor: value });
	}

	render() {
		const { state: { tmpName, tmpColor, nanakoState } } = this;

		return (
			<div styleName='base'>
				<div styleName='header'>
					<input
						type='text'
						value={tmpName}
						onChange={this.onChangeTmpName}
						placeholder='Name'
					/>
					<input
						type='text'
						value={tmpColor}
						onChange={this.onChangeTmpColor}
						placeholder='Color'
					/>
					<button onClick={this.addColor}>ADD</button>
				</div>
				<div styleName='colors'>
					{nanakoState.map((colorState, i) => (
						<ColorItem
							index={i}
							colorState={colorState}
							key={i}
							deleteThis={this.deleteColor}
							onChangeState={this.onChangeColorState}
						/>
					))}
				</div>
				<ToastContainer autoClose={3000} />
			</div>
		);
	}
}
