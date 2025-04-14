import {Turbo} from "./Turbo.es6";

export class ElementEventMapper {
	map;
	addEventListenerOriginal;

	constructor() {
		this.map = new Map();
		this.addEventListenerOriginal = EventTarget.prototype.addEventListener;

		const self = this;
		Element.prototype.addEventListener = function(type, listener, options) {
			self.addEventListenerTurbo(type, listener, options, this);
		};
	}

	has(name) {
		return this.map.has(name);
	}

	get(name) {
		return this.map.get(name);
	}

	/**
	 * This function overrides the Element.addEventListener function. It is
	 * required because Turbo needs to keep track of all events that are
	 * added to individual elements, so that when it updates the DOM and
	 * replaces elements in place, it can re-attach any added events to the
	 * newly replaced elements.
	 *
	 * The added functionality here stores a record of all "listener"
	 * functions that are added to elements, within the this.map data
	 * structure. Once we've kept a record of this, we call the original
	 * addEventListener function of the browser.
	 */
	addEventListenerTurbo = (type, listener, options, element) => {
		let mapObj = this.map.has(element)
			? this.map.get(element)
			: {};

// If there isn't already an array for the current element's event type,
// initialise an empty array. This is important because there may be multiple
// events of the same type added to a single element.
		if(mapObj[type] === undefined) {
			mapObj[type] = [];
		}
// TODO: Do we need to store the "options" in here as a tuple?
		mapObj[type].push(listener);
		this.map.set(element, mapObj);
		this.addEventListenerOriginal.call(
			element,
			type,
			listener,
			options,
		);

		Turbo.DEBUG && console.debug(`Event ${type} added to element:`, element);
	}
}
