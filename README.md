# A micro-framework for the client-side

Turbo is a minimalist JavaScript library that's shipped by default with [WebEngine]. Its purpose is to allow developers to build applications that follow basic HTTP principles, but gain the speed and usability of a single page application (SPA).

To use Turbo, convert a "regular" HTML form into a _turbo form_ by adding the `data-turbo` attribute:

```html
<form method="post" data-turbo>
	<label>
		<span>Your name</span>
		<input name="name" required />
	</label>
	<label>
		<span>Your email address</span>
		input name="email" type="email" required />
	</label>
	<button name="do" value="submit">Submit</button>
</form>
```

When the above form submits, because it has been marked with the `data-turbo` attribute, the default submit behaviour will be suppressed, and a [background fetch][fetch] will be emitted instead. When the fetch completes, the default behaviour is to replace the form with the form's counterpart on the new HTML document (after submitting the page), but other behaviours can be configured.

## Limitations compared to other libraries

PHP.Gt/Turbo aims to incentivise developers to use plain HTTP techniques, so web applications will 100% work without any JavaScript or CSS enabled. This promotes simple development techniques and as a result, the full development experience is simplified.

This design decision leads to a number of limitations compared to other libraries:

- GET and POST are the only methods available to you as a web developer. This library doesn't change that.
- Only actions like clicking a link or submitting a form will trigger Turbo; Turbo will not get invoked on actions that aren't available to plain HTTP. For example, Turbo will not send an HTTP request due to a mouse hover event or key press.
- Responses of the fetched pages are expected to be full pages by default - partial page renders are not the expectation, and violates plain HTTP usage.

## The name "turbo" is used elsewhere!

There used to be a library called _TurboLinks_, which heavily inspired the development decisions of Turbo, but since its demise it was deemed appropriate to name this library in homage to that. There are now plenty of JavaScript libraries calling themselves "Turbo", but as this library isn't expected to be used outside of the context of WebEngine development, the word turbo seems perfectly apt, as it takes the regular HTTP requests and responses and makes them faster, like a turbo charged engine.

[WebEngine]: https://www.php.gt/webengine/
[fetch]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
