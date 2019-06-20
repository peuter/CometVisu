/**
 * Shows the available icons.
 */
qx.Class.define('cv.ui.manager.viewer.Icons', {
  extend: cv.ui.manager.viewer.Folder,

  /*
  ***********************************************
    STATICS
  ***********************************************
  */
  statics: {
    SUPPORTED_FILES: /^CometVisu-Icons$/,
    TITLE: qx.locale.Manager.tr('Show icons'),
    ICON: cv.theme.dark.Images.getIcon('icons', 18)
  },

  /*
  ***********************************************
    MEMBERS
  ***********************************************
  */
  members: {
    _getDelegate: function () {
      return {
        createItem: function () {
          return new cv.ui.manager.core.IconAtom();
        },

        bindItem: function (controller, item, index) {
          controller.bindProperty('', 'label', null, item, index);
        }
      };
    },

    _onFilter: function () {
      var filterString = this.getChildControl('filter').getValue();
      var filtered = this.getModel().filter(function (name) {
        return name.includes(filterString);
      });
      this._controller.setModel(filtered);
    },

    _applyFile: function() {
      var container = this.getChildControl('list');
      if (!this._controller) {
        this._controller = new qx.data.controller.List(null, container);
        this._controller.setDelegate(this._getDelegate());
      }
      var model = this.getModel();
      // as the file is just a fake file, we do not really care about it
      Object.keys(cv.IconConfig.DB).filter(function (name) {
        var entry = cv.IconConfig.DB[name];
        return entry['*'] && entry['*']['*'] && qx.lang.Type.isFunction(entry['*']['*']['*']);
      }).forEach(function (name) {
        model.push(name);
      }, this);
      if (this.getChildControl('filter').getValue() || this.getPermanentFilter()) {
        this._onFilter();
      } else {
        this._controller.setModel(model);
      }
    }
  }
});