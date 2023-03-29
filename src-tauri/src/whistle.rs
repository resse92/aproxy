use crate::consts::FILE_NAME;
use std::fs;

#[tauri::command]
async fn copyNodeFiles(handle: &tauri::AppHandle) {
    let resource_path = handle
        .path_resolver()
        .resolve_resource(FILE_NAME)
        .expect("Cannot Open files.zip");

    let target_path = handle.path_resolver().resource_dir().unwrap();

    println!("path: {:?}", resource_path);
    let child = tokio::spawn(async {
        let file = fs::File::open(resource_path).unwrap();

        let mut archive = zip::ZipArchive::new(file).unwrap();
        let outpath_dir = target_path;
        print!("extract file to folder: {:?}", outpath_dir);
        for i in 0..archive.len() {
            let mut file = archive.by_index(i).unwrap();
            let outpath = match file.enclosed_name() {
                Some(path) => path.to_owned(),
                None => continue,
            };
            let outpath = outpath_dir.join(outpath);
            {
                let comment = file.comment();
                if !comment.is_empty() {
                    println!("File {i} comment: {comment}");
                }
            }

            if (*file.name()).ends_with('/') {
                fs::create_dir_all(&outpath).unwrap();
            } else {
                if let Some(p) = outpath.parent() {
                    if !p.exists() {
                        fs::create_dir_all(p).unwrap();
                    }
                }
                let mut outfile = fs::File::create(&outpath).unwrap();
                std::io::copy(&mut file, &mut outfile).unwrap();
            }

            // Get and Set permissions
            #[cfg(unix)]
            {
                use std::os::unix::fs::PermissionsExt;

                if let Some(mode) = file.unix_mode() {
                    fs::set_permissions(&outpath, fs::Permissions::from_mode(mode)).unwrap();
                }
            }
        }
    });

    child.await.expect("extract files.zip failure")
}

pub async fn init_whistle(handle: &tauri::AppHandle) {
    copyNodeFiles(handle).await;
}

pub fn start_whistle(handle: &tauri::AppHandle) {}
