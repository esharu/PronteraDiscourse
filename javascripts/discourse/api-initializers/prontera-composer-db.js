import { apiInitializer } from "discourse/lib/api";
import PronteraInsertDbModal from "../components/prontera-insert-db-modal";
import { contextGame } from "../lib/prontera-game";

// Composer toolbar: "Insert from the database". Opens a search over the
// hub of the current game and inserts the pick as a link to its hub page.
//
// `themePrefix` is injected by Discourse into theme JS.
/* global themePrefix */

export default apiInitializer("1.14.0", (api) => {
  const modal = api.container.lookup("service:modal");
  const router = api.container.lookup("service:router");

  api.onToolbarCreate((toolbar) => {
    toolbar.addButton({
      id: "prontera-insert-db",
      group: "extras",
      icon: "magnifying-glass",
      title: themePrefix("composer.insert_db"),
      perform: (toolbarEvent) => {
        modal.show(PronteraInsertDbModal, {
          model: {
            game: contextGame(router),
            insert: (text) => toolbarEvent.addText(text),
          },
        });
      },
    });
  });
});
