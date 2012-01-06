new function (undefined) {

module('[Atom Plugins] Declare');

test('Creating', function(){
	var Foo = atom.declare({
		name: 'default',

		initialize: function (name) {
			this.name = name;
		},

		property: 0,
		setProperty: function(property) { this.property = property; },
		getProperty: function() { return this.property; },

		_accessor: 0,
		set accessor(accessor) { this._accessor = accessor * 2; },
		get accessor() { return this._accessor + 5; }
	});

	var foo = new Foo('fooName');
	var bar = new Foo('barName');

	// instance
	equal(typeof foo, 'object', 'typeof foo == "object"');
	ok(foo instanceof Foo, 'foo instanceof Foo');

	// methods
	equal(foo.name, 'fooName', 'Foo.initialize');

	equal(foo.property, 0, 'Foo.property default value');
	equal(foo.getProperty(), 0, 'Foo.getProperty() default value');

	foo.setProperty(7);
	equal(foo.property, 7, 'Foo.property new value');
	equal(foo.getProperty(), 7, 'Foo.getProperty() new value');

	// getters/setters
	foo.accessor = 9;
	equal(foo._accessor, 18, 'Property setter');
	equal(foo.accessor , 23, 'Property getter');
});

test('Extending', function(){
	var Foo = atom.declare({
		name: null,
		initialize: function (name) { this.name = name; },

		property: 0,
		setProperty: function(property) { this.property = property; },
		getProperty: function() { return this.property; },

		_accessor: 0,
		set accessor(accessor) { this._accessor = accessor * 2; },
		get accessor() { return this._accessor + 5; },

		fooProperty: 21,
		setFooProperty: function(fooProperty) { this.fooProperty = fooProperty; },
		getFooProperty: function() { return this.fooProperty; },

		parentProperty: 1,
		setParentProperty: function(parentProperty) { this.parentProperty = parentProperty; },
		getParentProperty: function() { return this.parentProperty; },

		_parentSetterTest: 0,
		set parentSetterTest(value) { this._parentSetterTest = value * 2; },
		get parentSetterTest() { return this._parentSetterTest * 3; }
	});

	var Bar = atom.declare({
		parent: Foo,

		proto: {
			// test overload
			setProperty: function(property) {
				this.property = property * 2;
			},
			getProperty: function() { return this.property + 2; },

			// test independent properties
			barProperty: 0,
			setBarProperty: function(fooProperty) {
				this.barProperty = fooProperty;
			},
			getBarProperty: function() {
				return this.barProperty;
			},

			// test calling "parent" function
			setParentProperty: function(parentProperty) {
				Foo.prototype.setParentProperty.call(this, parentProperty + 3);
			},
			getParentProperty: function() {
				return Foo.prototype.getParentProperty.call(this) + 4;
			}
		}
	});


	var foo = new Foo('fooName');
	var bar = new Bar('barName');

	// instanceof
	ok(  foo instanceof Foo , '  foo instanceof Foo');
	ok(!(foo instanceof Bar), '!(foo instanceof Bar)');
	ok(  bar instanceof Foo , '  bar instanceof Foo');
	ok(  bar instanceof Bar , '  bar instanceof Bar');

	// methods
	equal(foo.name, 'fooName', 'Foo.initialize');
	equal(bar.name, 'barName', 'Bar.initialize');

	// Same in Foo
	equal(foo.property, 0, 'Foo.property default value');
	equal(foo.getProperty(), 0, 'Foo.getProperty() default value');
	foo.setProperty(7);
	equal(foo.property, 7, 'Foo.property new value');
	equal(foo.getProperty(), 7, 'Foo.getProperty() new value');

	// overloaded in Bar
	equal(bar.property, 0, 'Bar.property default value');
	equal(bar.getProperty(), 2, 'Bar.getProperty() overloaded');
	bar.setProperty(7);
	equal(bar.property, 14, 'Bar.property new value (overloaded)');
	equal(bar.getProperty(), 16, 'Bar.getProperty() new value (overloaded)');

	// Mathod "parent"
	equal(bar.parentProperty, 1, 'Bar.parentProperty default value');
	equal(bar.getParentProperty(), 5, 'Bar.getParentProperty() overloaded');
	bar.setParentProperty(7);
	equal(bar.parentProperty, 10, 'Bar.parentProperty new value (overloaded)');
	equal(bar.getParentProperty(), 14, 'Bar.getParentProperty() new value (overloaded)');

	// Setters/getters
	bar.accessor = 9;
	equal(bar._accessor, 18, 'Property setter is implemented');
	equal(bar.accessor,  23, 'Property getter is implemented');

});

test('Factory', function(){
	var Foo = atom.declare({
		name: 'Foo',

		firstname: null,
		lastname : null,
		initialize: function (firstname, lastname) {
			this.firstname = firstname;
			this.lastname  = lastname;
		}
	});

	var Bar = atom.declare({
		name: 'Bar',

		parent: Foo,

		proto: {
			surname : null,
			initialize: function (firstname, lastname, surname) {
				Foo.prototype.initialize.call(this, firstname, lastname);
				this.surname = surname;
			}
		}
	});

	var foo = Foo.factory(['fooFN', 'fooLN']);
	var bar = Bar.factory(['barFN', 'barLN', 'barSN']);

	// instanceof
	ok(  foo instanceof Foo , '  foo instanceof Foo');
	ok(!(foo instanceof Bar), '!(foo instanceof Bar)');
	ok(  bar instanceof Foo , '  bar instanceof Foo');
	ok(  bar instanceof Bar , '  bar instanceof Bar');

	equal(foo.firstname, 'fooFN', 'foo.firstname');
	equal(foo.lastname , 'fooLN', 'foo.lastname');
	equal(bar.firstname, 'barFN', 'bar.firstname');
	equal(bar.lastname , 'barLN', 'bar.lastname');
	equal(bar.surname  , 'barSN', 'bar.surname');
});

test('Static', function(){

	var Foo = atom.declare({
		own: {
			fooStat: 'fooStatValue',
			qweStat: 'qweStatValue'
		},

		proto: {}
	});

	var Bar = atom.declare({
		parent: Foo,
		own: {
			qweStat: 'qweStat[Bar]',
			barStat: 'barStatValue'
		},
		proto: {}
	});

	var foo = new Foo();
	var bar = new Bar();

	equal(foo.constructor, Foo, 'correct Foo constructor');
	equal(bar.constructor, Bar, 'correct Bar constructor');

	equal(foo.constructor.fooStat, 'fooStatValue', 'foo.constructor.fooStat');
	equal(foo.constructor.qweStat, 'qweStatValue', 'foo.constructor.qweStat');
	equal(foo.constructor.barStat,      undefined, 'foo.constructor.barStat');

	equal(bar.constructor.fooStat, 'fooStatValue', 'bar.constructor.fooStat');
	equal(bar.constructor.qweStat, 'qweStat[Bar]', 'bar.constructor.qweStat');
	equal(bar.constructor.barStat, 'barStatValue', 'bar.constructor.barStat');
});

test('invoke', function () {

	var Foo = atom.declare({
		initialize: function (x) {
			this.x = x;
		}
	});

	var foo = Foo(42);
	ok( foo instanceof Foo, 'Class invokation successful' );
	equal( foo.x, 42, 'Class construction successful' );

	var Bar = atom.declare({
		own: {
			invoke: function () {
				return Foo.factory(arguments);
			}
		},

		proto: {}
	});

	var bar = Bar(13);

	ok( !(bar instanceof Bar), 'Class invokation rewritten' );
	equal( bar.x, 13, 'Class invokation rewritten successful' );
});

test('AutoDefine', function () {

	var Foo = atom.declare( 'DeclareAutoDefine.Qux.Foo' );

	equal( Foo, DeclareAutoDefine.Qux.Foo, 'declare auto define' );
	equal( Foo.NAME, 'DeclareAutoDefine.Qux.Foo', 'defineName as constructor name' );

});

test('With Class', function () {

	var Foo = atom.declare({
		initialize: function () {

		}
	});

});

};