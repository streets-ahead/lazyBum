## Helpers

Helpers are basically collections of functions that  "help" with specific tasks.  Helpers do not need to be written using any special convention, they are simply node.js modules that are placed inside of the "helpers" directory.  Helpers can be added to a controller, once added they can be accessed using the "this" variable.  Any helper that is included in a controller will also be available in the template.

An example of how to register the html helper in a controller.

	this.prototype.helpers = ['html'];