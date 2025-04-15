import { vi, describe, it, expect, beforeEach } from "vitest";
import { Turbo } from "../src/Turbo.es6";
import {ElementEventMapper} from "../src/ElementEventMapper.es6";

describe("Turbo", () => {
	let element;

	it("attaches event listeners to form elements marked with data-turbo", () => {
		document.body.innerHTML = `
		<h1>This is a test!</h1>
		<form method="post" data-turbo>
			<output>0</output>
			<button name="do" value="increment">Increment</button>
			<button name="do" value="decrement">Decrement</button>
		</form>
		`;

		let form = document.forms[0];
		const spy = vi.spyOn(form, "addEventListener");
		new Turbo();
		expect(spy).toHaveBeenCalledWith("submit", expect.any(Function));
	});

	it("attaches event listeners to buttons with data-turbo=submit", () => {
		document.body.innerHTML = `
		<h1>This is a test!</h1>
		<form method="post" data-turbo="update-inner">
			<output>0</output>
			<button name="do" value="increment" data-turbo="submit">Increment</button>
			<button name="do" value="decrement" data-turbo="submit">Decrement</button>
		</form>
		`;
// TODO: Actually test something real here... first we need to see what's happening in a real browser, and compare accordingly.

		let form = document.forms[0];
		let elementEventMapper = new ElementEventMapper();
		const spy = vi.spyOn(elementEventMapper, "addToMapType");
		let turbo = new Turbo(undefined, elementEventMapper);
		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenCalledWith(
			expect.any(HTMLElement),
			"submit",
			expect.any(Function),
		);
	});
});
