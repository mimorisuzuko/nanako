import React, { Component } from 'react';
import autobind from 'autobind-decorator';
import Color from 'color';
import Input from './Input';
import { MdClose, MdContentCopy } from 'react-icons/md';
import copy from 'copy-to-clipboard';
import './ColorItem.scss';

export default class ColorItem extends Component {
	/**
	 * @param {Event} e
	 */
	@autobind
	onChangeName(e) {
		const { props: { onChangeState, index } } = this;
		const { currentTarget: { value } } = e;

		onChangeState(index, { key: 'name', value });
	}

	/**
	 * @param {Event} e
	 */
	@autobind
	onChangeColor(e) {
		const { props: { onChangeState, index } } = this;
		const { currentTarget: { value } } = e;

		onChangeState(index, { key: 'color', value });
	}

	@autobind
	deleteThis() {
		const { props: { index, colorState, deleteThis } } = this;

		deleteThis(index, colorState);
	}

	@autobind
	copyColor() {
		const { props: { colorState } } = this;

		copy(
			Color(colorState.get('color'))
				.hex()
				.substring(1)
		);
	}

	render() {
		const { props: { colorState } } = this;
		const color = colorState.get('color');
		const name = colorState.get('name');
		const fontColor = Color(color).isLight() ? 'black' : 'white';

		return (
			<div
				styleName='base'
				style={{
					backgroundColor: color,
					color: fontColor
				}}
			>
				<MdClose
					onClick={this.deleteThis}
					style={{ borderRightColor: fontColor }}
				/>
				<MdContentCopy
					onClick={this.copyColor}
					style={{ borderRightColor: fontColor }}
				/>
				<Input type='text' value={name} onChange={this.onChangeName} />
				<span>/</span>
				<Input
					type='text'
					value={color}
					onChange={this.onChangeColor}
				/>
			</div>
		);
	}
}
