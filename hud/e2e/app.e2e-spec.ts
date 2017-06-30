import { HudPage } from './app.po';

describe('hud App', () => {
  let page: HudPage;

  beforeEach(() => {
    page = new HudPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
