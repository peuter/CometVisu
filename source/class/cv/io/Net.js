/* Net.js
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
qx.Class.define('cv.io.Net', {
  type: 'static',

  /*
  ***********************************************
    STATICS
  ***********************************************
  */
  statics: {
    /**
     * Very basic window.fetch replacement that does not support the `init` parameter and therefore only supports
     * GET requests. Uses `qx.io.request.Xhr` internally which supports the XHR calls being recorded / replayed
     * by CometVisus own recording feature. window.fetch calls are not supported by the recording feature and get lost.
     *
     * @param url {string}
     * @return {Promise<unknown>}
     */
    fetch(url) {
      return new Promise(resolve => {
        const xhr = new qx.io.request.Xhr(url);
        xhr.addListenerOnce('success', e => {
          const req = e.getTarget();
          const response = new Response(req.getResponse(), {
            status: req.getStatus(),
            statusText: req.getStatusText()
          });

          resolve(response);
        });
        xhr.addListenerOnce('error', e => {
          const req = e.getTarget();
          const response = new Response(req.getResponse(), {
            status: req.getStatus(),
            statusText: req.getStatusText()
          });

          resolve(response);
        });
        xhr.send();
      });
    }
  }
});
