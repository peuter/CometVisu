/* Page.js
 *
 * copyright (c) 2010-2022, Christian Mayer and the CometVisu contributers.
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation; either version 3 of the License, or (at your option)
 * any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA
 */

/**
 *
 */
qx.Class.define('cv.parser.pure.widgets.Page', {
  type: 'static',

  /*
   ******************************************************
   STATICS
   ******************************************************
   */
  statics: {
    parse(page, path, flavour, pageType) {
      const storagePath = cv.parser.pure.WidgetParser.getStoragePath(page, path);

      const addresses = {};
      const src = page.getAttribute('ga');
      if (src) {
        cv.data.Model.getInstance().addAddress(src, storagePath);
        const transform = page.getAttribute('transform') ?? 'DPT:1.001';
        const clients = page.getAttribute('clients') ?? '';
        addresses[src] = { transform, mode: cv.data.Model.READ, clients };
      }

      const name = page.getAttribute('name');
      pageType = page.getAttribute('type') || 'text'; //text, 2d or 3d
      const backdrop = page.getAttribute('backdrop');
      const showtopnavigation = page.getAttribute('showtopnavigation')
        ? page.getAttribute('showtopnavigation') === 'true'
        : null;
      const showfooter = page.getAttribute('showfooter') ? page.getAttribute('showfooter') === 'true' : true;
      // make sure the type has the correct value as we need to use it ass CSS class
      switch (pageType) {
        case '2d':
        case '3d':
          // do nothing, type has correct value
          break;
        default:
          pageType = 'text';
          break;
      }

      // automatically set the navbars if not set in the config file
      const shownavbar = {
        top: path === 'id' ? false : null,
        bottom: path === 'id' ? false : null,
        left: path === 'id' ? false : null,
        right: path === 'id' ? false : null
      };

      Array.from(page.children)
        .filter(function (m) {
          return m.matches('navbar');
        })
        .forEach(function (elem) {
          shownavbar[elem.getAttribute('position') || 'left'] = true;
        });
      // overwrite default when set manually in the config
      ['top', 'left', 'right', 'bottom'].forEach(function (pos) {
        if (shownavbar[pos] !== null) {
          // do not override current values
          return;
        }
        const value = page.getAttribute('shownavbar-' + pos);
        if (typeof value === 'string') {
          shownavbar[pos] = value === 'true';
        }
      }, this);
      let bindClickToWidget = cv.Config.configSettings.bindClickToWidget;
      if (page.getAttribute('bind_click_to_widget')) {
        bindClickToWidget = page.getAttribute('bind_click_to_widget') === 'true';
      }
      if (page.getAttribute('flavour')) {
        flavour = page.getAttribute('flavour'); // sub design choice
      }
      let wstyle = ''; // widget style
      if (page.getAttribute('align')) {
        wstyle += 'text-align:' + page.getAttribute('align') + ';';
      }
      if (wstyle !== '') {
        wstyle = 'style="' + wstyle + '"';
      }

      const layout = cv.parser.pure.WidgetParser.parseLayout(
        Array.from(page.children).filter(function (m) {
          return m.matches('layout');
        })[0]
      );

      let backdropType = null;
      if (backdrop) {
        backdropType = backdrop.substring(backdrop.length - 4) === '.svg' ? 'embed' : 'img';
      }

      const data = cv.data.Model.getInstance().setWidgetData(storagePath, {
        path: storagePath,
        name: name,
        pageType: pageType,
        showTopNavigation: showtopnavigation,
        showFooter: showfooter,
        showNavbarTop: shownavbar.top,
        showNavbarBottom: shownavbar.bottom,
        showNavbarLeft: shownavbar.left,
        showNavbarRight: shownavbar.right,
        backdropAlign: pageType === '2d' ? page.getAttribute('backdropalign') || '50% 50%' : null,
        size: page.getAttribute('size') || null,
        address: addresses,
        linkVisible: page.getAttribute('visible') ? page.getAttribute('visible') === 'true' : true,
        flavour: flavour || null,
        $$type: 'page',
        backdrop: backdrop || null,
        backdropType: backdropType
      });

      cv.parser.pure.WidgetParser.parseAddress(page, path);
      cv.parser.pure.WidgetParser.parseFormat(page, path);
      // this has to be called manually to allow inheritance of the flavour, pageType values
      cv.parser.pure.WidgetParser.parseChildren(page, path, flavour, pageType);
      if (data.linkVisible === true) {
        const linkData = cv.data.Model.getInstance().setWidgetData(path, {
          $$type: 'pagelink',
          path: path,
          name: name,
          classes: cv.parser.pure.WidgetParser.setWidgetLayout(page, path) || '',
          layout: layout || null,
          address: addresses,
          pageType: pageType,
          wstyle: wstyle || '',
          bindClickToWidget: bindClickToWidget
        });

        return [data, linkData];
      }
      return data;
    }
  },

  defer(statics) {
    cv.parser.pure.WidgetParser.addHandler('page', statics);
  }
});
