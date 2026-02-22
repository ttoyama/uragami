use std::fs;
use std::path::PathBuf;

const SHEET_COUNT: usize = 3;

fn data_dir() -> PathBuf {
    dirs::home_dir()
        .expect("home directory not found")
        .join("Documents")
        .join("uragami")
}

fn ensure_data_dir() {
    let dir = data_dir();
    if !dir.exists() {
        let _ = fs::create_dir_all(&dir);
    }
}

#[tauri::command]
fn load_all_sheets() -> Vec<String> {
    ensure_data_dir();
    (1..=SHEET_COUNT)
        .map(|i| {
            let path = data_dir().join(format!("sheet_{}.txt", i));
            fs::read_to_string(&path).unwrap_or_default()
        })
        .collect()
}

#[tauri::command]
fn save_sheet(index: usize, contents: String) {
    ensure_data_dir();
    if index < SHEET_COUNT {
        let path = data_dir().join(format!("sheet_{}.txt", index + 1));
        let _ = fs::write(&path, &contents);
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![load_all_sheets, save_sheet])
        .setup(|app| {
            use tauri::menu::{Menu, PredefinedMenuItem, Submenu};

            let app_menu = Submenu::with_items(
                app,
                "uragami",
                true,
                &[
                    &PredefinedMenuItem::about(app, None, None)?,
                    &PredefinedMenuItem::separator(app)?,
                    &PredefinedMenuItem::hide(app, None)?,
                    &PredefinedMenuItem::hide_others(app, None)?,
                    &PredefinedMenuItem::show_all(app, None)?,
                    &PredefinedMenuItem::separator(app)?,
                    &PredefinedMenuItem::quit(app, None)?,
                ],
            )?;

            let edit_menu = Submenu::with_items(
                app,
                "Edit",
                true,
                &[
                    &PredefinedMenuItem::undo(app, None)?,
                    &PredefinedMenuItem::redo(app, None)?,
                    &PredefinedMenuItem::separator(app)?,
                    &PredefinedMenuItem::cut(app, None)?,
                    &PredefinedMenuItem::copy(app, None)?,
                    &PredefinedMenuItem::paste(app, None)?,
                    &PredefinedMenuItem::separator(app)?,
                    &PredefinedMenuItem::select_all(app, None)?,
                ],
            )?;

            let menu = Menu::with_items(app, &[&app_menu, &edit_menu])?;
            app.set_menu(menu)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
