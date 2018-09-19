import React, { Component, createRef } from 'react';
import autobind from 'autobind-decorator';
import _ from 'lodash';

export default class Input extends Component {
	static get MIN_WIDTH() {
		return 20;
	}

	constructor() {
		super();

		this.state = { width: Input.MIN_WIDTH };
		this.inputRef = createRef();
	}

	componentDidMount() {
		const { props: { value } } = this;

		this.setState({ width: this.calculateWidth(value) });
	}

	/**
	 * @param {string} str
	 */
	calculateWidth(str) {
		const { inputRef: { current: $input } } = this;
		const { cssText } = getComputedStyle($input);
		const $span = document.createElement('span');

		$span.style.cssText = cssText;
		$span.style.width = 'auto';
		$span.innerText = str;
		document.body.appendChild($span);
		const { width } = $span.getBoundingClientRect();
		$span.remove();

		return width;
	}

	/**
	 * @param {Event} e
	 */
	@autobind
	onChange(e) {
		const { props: { onChange } } = this;
		const { currentTarget: { value } } = e;

		onChange(e);
		this.setState({ width: this.calculateWidth(value) });
	}

	render() {
		const { props, state: { width } } = this;
		const keys = _.filter(_.keys(props), (a) => a !== 'onChange');
		const picked = _.pick(_.cloneDeep(props), keys);

		picked.style = _.merge(picked.style, { width, boxSizing: 'border-box' });

		return <input onChange={this.onChange} {...picked} ref={this.inputRef} />;
	}
}
