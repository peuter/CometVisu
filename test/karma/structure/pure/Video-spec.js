/**
 * Unit tests for video widget
 *
 */

define( ['widget_video'], function() {

  describe("testing a video widget", function() {

    it("should test the video creator", function() {

      var res = this.createTestWidgetString("video", {}, '<label>Test</label>');
      var widget = $(res[1]);
      expect(res[0].getPath()).toBe("id_0");
    
      expect(widget).toHaveClass('video');
      expect(widget.find("div.label").text()).toBe('Test');


    });
  });
});