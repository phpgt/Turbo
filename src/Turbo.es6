import {Style} from "./Style.es6";
import {ElementEventMapper} from "./ElementEventMapper.es6";

export class Turbo {
	static DEBUG = false;
	style;
	elementEventMapper;
	parser;

	/**
	 * An object storing collections of elements that need to be updated
	 * when the document undergoes changes. The keys of this object represent
	 * the update type (e.g., "inner", "outer", etc.), while the values are
	 * arrays containing the corresponding DOM elements that require updates.
	 * @type {Object.<string, HTMLElement[]>}
	 */
	updateElementCollection = {};

	constructor() {
		handleWindowPopState();
		let style = new Style();
		style.addToDocument();
		this.elementEventMapper = new ElementEventMapper();

		document.querySelectorAll("[data-turbo]").forEach(this.init);
		this.parser = new DOMParser();
	}

	/**
	 * Initialise a single element in the document with its functionality
	 * as specified by the data-turbo attribute.
	 *
	 * data-turbo="update" - Synonymous with update-outer
	 * data-turbo="update-outer" - Updates the outerHTML of the element when
	 * the page updates
	 * data-turbo="update-inner" - Updates the innerHTML of the element when
	 * the page updates
	 * data-turbo="autosave" - This element will become hidden, and any
	 * "change" event on any element within this element's containing form
	 * will trigger a background save by clicking this button
	 * data-turbo="submit" - When clicked, this element will submit its
	 * containing form in the background
	 */
	init = (turboElement) => {
		let turboType = turboElement.dataset["turbo"];

		if(turboType === "autosave") {
			this.initAutoSave(turboElement);
		}
		else if(turboType.startsWith("update")) {
			let updateType = null;

			if(turboType === "update" || turboType === "update-outer") {
				updateType = "outer";
			}
			else if(turboType === "update-inner") {
				updateType = "inner";
			}

			this.storeUpdateElement(turboElement, updateType);
		}
		else if(turboType === "submit") {
			this.initAutoSubmit(turboElement);
		}
		else {
			throw new TypeError(`Unknown turbo element type: ${turboType}`);
		}
	}

	initAutoSave = (turboElement) => {
		if(!(turboElement instanceof HTMLButtonElement)) {
			throw new TypeError("data-turbo type \"autosave\" must be applied to a button element.");
		}

		if(!turboElement.form) {
			throw new TypeError("data-turbo type \"autosave\" must have a containing form element.");
		}

		if(!turboElement.form.turboObj) {
			turboElement.form.turboObj = {};
		}

		turboElement.form.turboObj.autoSave = {
			key: turboElement.name,
			value: turboElement.value,
		};

		turboElement.form.dataset["turboObj"] = "";
		turboElement.form.addEventListener("change", this.formChangeAutoSave);
		turboElement.form.addEventListener("submit", this.formSubmitAutoSave);
		Turbo.DEBUG && console.debug("initAutoSave completed", turboElement);
	}

	initAutoSubmit = (turboElement) => {
		if(!(turboElement instanceof HTMLButtonElement)) {
			throw new TypeError("data-turbo type \"submit\" must be applied to a button element.");
		}

		if(!turboElement.form) {
			throw new TypeError("data-turbo type \"submit\" must have a containing form element.");
		}

		turboElement.form.addEventListener("submit", this.autoSubmit);
	}

	/**
	 * The updateElementCollection arrays are lists of all elements that
	 * require updating when the document updates. When something happens
	 * that requires the document to update, the processUpdateElements
	 * function will iterate over these stored updateElements and update
	 * their content accordingly.
	 */
	storeUpdateElement = (element, updateType) => {
		if(!updateType) {
			updateType = "_none";
		}

		if(this.updateElementCollection[updateType] === undefined) {
			this.updateElementCollection[updateType] = [];
		}

		this.updateElementCollection[updateType].push(element);
		Turbo.DEBUG && console.debug("storeUpdateElement completed", `Pushing into ${updateType}: `, element);
	}

	autoSubmit = (e) => {
		e.preventDefault();

// A 0 timeout is used here to ensure the code inside the setTimeout
// is executed asynchronously and after the current execution context
// (i.e., the main event loop completes any ongoing operations).
// This guarantees that the form submission logic is properly executed after any
// other immediate synchronous operations tied to the event.
		setTimeout(() => {
			this.submitForm(e.target, this.completeAutoSave, e.submitter);
		}, 0);
	}

	submitForm = (form, callback, submitter) => {
		let formData = this.getFormDataForButton(
			form,
			"autoSave",
			submitter,
		);
		form.classList.add("submitting");

		fetch(form.action, {
			method: form.getAttribute("method"),
			credentials: "same-origin",
			body: formData,
		}).then(response => {
			form.classList.remove("submitting");

			if(!response.ok) {
				console.error("Form submission error", response);
				return;
			}

			history.pushState({
				"action": "submitForm",
			}, "", response.url);
			return response.text();
		}).then(html => {
			callback(this.parser.parseFromString(
				html,
				"text/html"
			));
		});
	}

	getFormDataForButton = (form, type, submitter) => {
		let formData = new FormData(form);
		if(submitter) {
			formData.set(submitter.name, submitter.value);
		}
		else if(form.turboObj[type]) {
			formData.set(
				form.turboObj[type].key,
				form.turboObj[type].value,
			);
		}

		return formData;
	}

	completeAutoSave = (newDocument) => {
		if(newDocument.head.children.length === 0) {
			if(Turbo.DEBUG) {
				alert("Error processing new document!");
			}

			console.error("Error processing new document!");
			location.reload();
		}

// The setTimeout with 0 delay doesn't mean it would execute immediately, it
// schedules the execution immediately after the running script to strive to
// execute as soon as possible. This is also known as yielding to the browser.
// It's necessary to allow for click events to be processed before updating the
// DOM mid-click and causing clicks to be missed on children of updated elements.
		setTimeout(() => {
			this.processUpdateElements(newDocument);
		}, 0);
	}

	formChangeAutoSave = (e) => {
		let form = e.target;
		if(form.form instanceof HTMLFormElement) {
			let element = form;
			element.classList.add("input-changed");
			(function(c_element) {
				setTimeout(function() {
					c_element.classList.remove("input-changed");
				}, 100);
			})(element);

			form = form.form;
		}

		this.submitForm(form, this.completeAutoSave);
	}

	formSubmitAutoSave = (e) => {
		e.preventDefault();
		document.activeElement.blur();
		let form = e.target;
		if(form.form instanceof HTMLFormElement) {
			form = form.form;
		}

		let recentlyChangedInput = form.querySelectorAll(".input-changed");
		if(recentlyChangedInput.length > 0) {
			return;
		}

		let submitter = null;
		if(e.submitter instanceof HTMLButtonElement) {
			submitter = e.submitter;
		}

		this.submitForm(form, this.completeAutoSave, submitter);
	}

	/**
	 * The updateElementCollection arrays are lists of all elements that
	 * require updating when the document updates. This function is
	 * triggered whenever the document's data changes, so the updateElements
	 * can be swapped out from the old document with the new document's
	 * counterpart elements.
	 */
	processUpdateElements = (newDocument) => {
		let autofocusElement = newDocument.querySelector("[autofocus]");
		if(autofocusElement) {
			autofocusElement.dataset["turboAutofocus"] = "";
		}

		for(let type of Object.keys(this.updateElementCollection)) {
			this.updateElementCollection[type].forEach(existingElement => {
				if(!existingElement) {
					return;
				}

				let activeElement = null;
				let activeElementSelection = null;
				let activeElementValue = null;
				if(existingElement.contains(document.activeElement)) {
					activeElement = getXPathForElement(document.activeElement);
					activeElementSelection = [];
					activeElementValue = document.activeElement.value;
					if(document.activeElement.selectionStart >= 0 && document.activeElement.selectionEnd >= 0) {
						activeElementSelection.push(document.activeElement.selectionStart, document.activeElement.selectionEnd);
					}
				}
				let xPath = getXPathForElement(existingElement, document);
				let xPathResult = newDocument.evaluate(xPath, newDocument.documentElement);
				let newElement = xPathResult.iterateNext();

				if(type === "outer") {
					let existingElementIndex = this.updateElementCollection[type].indexOf(existingElement);
					this.updateElementCollection[type][existingElementIndex] = newElement;
					if(newElement) {
						this.reattachEventListeners(existingElement, newElement);
						this.reattachTurboElements(existingElement, newElement);
						existingElement.replaceWith(newElement);
					}
				}
				else if(type === "inner") {
					this.reattachEventListeners(existingElement, newElement);
					this.reattachTurboElements(existingElement, newElement);

					while(existingElement.firstChild) {
						existingElement.removeChild(existingElement.firstChild);
					}
					while(newElement && newElement.firstChild) {
						existingElement.appendChild(newElement.firstChild);
					}
				}

				if(activeElement) {
					Turbo.DEBUG && console.debug("Active element", activeElement);
					let elementToActivate = document.evaluate(activeElement, document.documentElement).iterateNext();
					if(elementToActivate) {
						Turbo.DEBUG && console.debug("Element to activate", elementToActivate, activeElementSelection);
						elementToActivate.focus();
						elementToActivate.value = activeElementValue;
						if(elementToActivate.setSelectionRange) {
							elementToActivate.setSelectionRange(activeElementSelection[0], activeElementSelection[1]);
						}

						let completeClickFunction = () => {
							elementToActivate.removeEventListener("mouseup", completeClickFunction);

							setTimeout(() => {
								Turbo.DEBUG && console.debug("Completing click", elementToActivate);
								elementToActivate.click();
							}, 10)
						};
						this.elementEventMapper.addEventListenerOriginal.call(
							elementToActivate,
							"mouseup",
							completeClickFunction,
						);
					}
				}
			});
		}

		document.querySelectorAll("[data-turbo-autofocus]").forEach(autofocusElement => {
			autofocusElement.focus();
		});
	}

	reattachEventListeners = (oldElement, newElement) => {
		if(!this.elementEventMapper.has(oldElement)) {
			return;
		}

		let mapObj = this.elementEventMapper.get(oldElement);
		for(let type of Object.keys(mapObj)) {
			for(let listener of mapObj[type]) {
				Turbo.DEBUG && console.debug("Listener for element:", oldElement, listener);
			}
		}
	}

	reattachTurboElements = (oldElement, newElement) => {
		if(!newElement) {
			return;
		}

		newElement.querySelectorAll("[data-turbo]").forEach(this.init);
		oldElement.querySelectorAll("[data-turbo-obj]").forEach(turboElement => {
			let xPath = getXPathForElement(turboElement, oldElement);
			let newTurboElement = newElement.ownerDocument.evaluate(xPath, newElement).iterateNext();
			if(newTurboElement) {
				newTurboElement.turboObj = turboElement.turboObj;
				newTurboElement.dataset["turboObj"] = "";
			}
		});
	}
}

/**
 * This is required for when the user presses the back button in their browser.
 * Because we're pushing a history state, the back button would break. Adding
 * this simple function reloads the page when the back button is pressed.
 */
function handleWindowPopState() {
	window.addEventListener("popstate", e => {
		location.href = document.location;
	});
}

/** This was adapted from https://developer.mozilla.org/en-US/docs/Web/XPath/Snippets */
function getXPathForElement(element, context) {
	let xpath = "";
	if(context instanceof Document) {
		context = context.documentElement;
	}
	if(!context) {
		context = element.ownerDocument.documentElement;
	}

	while(element !== context) {
		let pos = 0;
		let sibling = element;
		while(sibling) {
			if(sibling.nodeName === element.nodeName) {
				pos += 1;
			}
			sibling = sibling.previousElementSibling;
		}

		xpath = `./${element.nodeName}[${pos}]/${xpath}`;
		element = element.parentElement;
	}
	xpath = xpath.replace(/\/$/, "");
	return xpath;
}
