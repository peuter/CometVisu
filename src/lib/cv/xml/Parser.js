
define( [
  'joose',
  'lib/cv/Object'
  ],
  function () {
    Class('cv.xml.Parser', {
      isa: cv.Object,

      my: {
        has: {
          handlers: {is: 'rw', init: {}}
        },

        methods: {
          addHandler: function (tagName, handler) {
            this.handlers[tagName.toLowerCase()] = handler;
          },

          getHandler: function (tagName) {
            return this.handlers[tagName.toLowerCase()];
          },

          parse: function (xml, path, flavour, pageType) {
            var parser = this.getHandler(xml.nodeName.toLowerCase());
            if (parser) {
              return parser.parse(xml, path, flavour, pageType);
            } else {
              console.error("no parse handler registered for type: %s", xml.nodeName.toLowerCase());
            }
            return null;
          }
        }
      }
    });
  }
);