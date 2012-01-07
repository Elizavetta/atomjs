/*
---

name: "Options"

description: ""

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

requires:
	- declare

provides: Options

...
*/


declare( 'atom.Options',
/** @class atom.Options */
{
	/** @private */
	fast: false,

	/** @private */
	values: {},

	/**
	 * @constructs
	 * @param {Object} [initialValues]
	 * @param {Boolean} [fast=false]
	 */
	initialize: function (initialValues, fast) {
		if (!this.isValidOptions(initialValues)) {
			fast = !!initialValues;
			initialValues = null;
		}

		this.values = initialValues || {};
		this.fast   = !!fast;
	},

	/**
	 * @param {atom.Events} events
	 * @return atom.Options
	 */
	addEvents: function (events) {
		this.events = events;
		return this.invokeEvents();
	},

	/**
	 * @param {String} name
	 */
	get: function (name) {
		return this.values[name];
	},

	/**
	 * @param {Object} options
	 * @return atom.Options
	 */
	set: function (options) {
		var method = this.fast ? 'append' : 'extend';
		if (this.isValidOptions(options)) {
			atom[method](this.values, options);
		}
		this.invokeEvents();
		return this;
	},

	/**
	 * @param {String} name
	 * @return atom.Options
	 */
	unset: function (name) {
		delete this.values[name];
		return this;
	},

	/** @private */
	isValidOptions: function (options) {
		return options && typeof options == 'object';
	},

	/** @private */
	invokeEvents: function () {
		if (!this.events) return this;

		var values = this.values, name, option;
		for (name in values) {
			option = values[name];
			if (this.isInvokable(name, option)) {
				this.events.add(name, option);
				this.unset(name);
			}
		}
		return this;
	},

	/** @private */
	isInvokable: function (name, option) {
		return name &&
			option &&
			atom.typeOf(option) == 'function' &&
			(/^on[A-Z]/).test(name);
	}
});

declare( 'atom.Options.Mixin',
/** @class atom.Options.Mixin */
{
	/**
	 * @private
	 * @property atom.Options
	 */
	_options: null,
	options: {},

	setOptions: function (options) {
		if (!this._options) {
			this._options = new atom.Options(
				atom.clone(this.options || {})
			);
			this.options = this._options.values;
		}

		for (var i = 0; i < arguments.length; i++) {
			this._options.set(arguments[i]);
		}

		return this;
	}
});