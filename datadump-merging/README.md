# Procedure for updating data

New assets (e.g. images, asset files) can be extracted from the game using a 
tool like [AssetRipper](https://github.com/AssetRipper/AssetRipper).

## Prerequisite environment setup

Before running the npm scripts, first setup the Node environment:

### Node

1. Install a recent release of the [Node JS runtime](https://nodejs.org/).

2. Ensure the working directory is this folder (`datadump-merging/`). You may need to change directory using a command such as
    ```bash
    cd datadump-merging
    ```

3. Install dependencies:
    ```bash
    npm ci
    ```

### Python with GDAL (only required for map tiling script)

The map tiling script utilizes [gdal2tiles-leaflet](), and needs Python installed with the GDAL module.

1. Download the git submodule gdal2tiles-leaflet:
    ```bash
    git submodule update --init --recursive
    ```

1. Install Python 3.

2. Install GDAL for Python:

    - **Windows:**

      ```bash
      pip install gdal
      ```

      `pip install gdal` may fail with an error like
      "Microsoft Visual C++ 14.0 or greater is required".
      If you encounter this, and installing the build tools is not feasible:
      
      - Try downloading a prebuilt wheel (recent ones available at
      https://github.com/cgohlke/geospatial-wheels/releases/.
      take note of the release assets beginning with "GDAL")
      
      - ```bash
        pip install path/to/wheel/file.whl
        ```

    - **Mac:**

      TODO instructions

    - **Linux:**

      TODO instructions

## Updating the map's images and regenerating the map's tiles
When new islands are added, or existing islands are changed,
an update to the map tiles is needed.

1. Ensure you have Python installed with the GDAL module.
    (see [Prerequisite environment setup](#prerequisite-environment-setup))

2. Extract the new image assets if you have not done so already.

    > [!NOTE]  
    > The map island images can be extracted from the game using a tool like
    > https://github.com/AssetRipper/AssetRipper.

3. Place the new island images into `_ripped_mapimgs/`.
   
    > [!TIP]  
    > The island images' filenames are expected to be like `Map_*.png` (example: `Map_Bluffs.png`) or `*To*.png` (example: `GorgeToLabyrinth.png`).  
    > This is specified in [`asset_paths.js`](./asset_paths.js).  
    > If the filename format has changed, then [`asset_paths.js`](./asset_paths.js) likely needs updated.

4. Run the command:
    ```bash
    npm run map
    ```
    This will:

    - Update `data_out/stitchedMapRainbowIsland.png` and `data_out/stitchedMapLabyrinth.png`.  
    This may take several seconds — the map is large with a high resolution.
    
    - Tile the new map images to `map_RI/` and `map_Labyrinth/`, respectively.  
    This will take several seconds — the map is large with a high resolution.
      > Note: the map tile directories are intentionally ignored in `.gitignore`.

    > [!TIP]  
    > You can optionally specify the following cli flags:
    >
    > `--pycli <executable>`:
    >
    > - Specify a custom name or path for your desired Python executable.
    >   Useful for alternate installs, system path exclusions, virtual environments, etc.
    >
    >   When specified, script will replace the call to Python's package manager `pip` with `<executable> -m pip`.  
    >   For example, using `--pycli C:\some\path\py.exe` will result in pip being called as `C:\some\path\py.exe -m pip`.
    >
    >   ```bash
    >   # Example usage:
    >   npm run map -- --pycli C:\some\path\py.exe
    >   ```
    >
    >   The default Python executable name used is:
    >   - Windows: `py`
    >   - Linux: `python3`
    >   - Mac OS and others: `python`
    > 
    > `--nocopytilemap`:
    >
    > - Only stitch together the complete map image into `data_out/`; Do not tile the map nor copy the tiles to the main project.

## For contribution and development

> [!IMPORTANT]  
> The map tiles should be regenerated before starting the man project's dev server for the first time after cloning this project,
> or after updating the map assets.
>
> Refer to [Updating the map's images and regenerating the map's tiles](#updating-the-maps-images-and-regenerating-the-maps-tiles).

## Updating or adding new markers (treasure pods, research drones, gordos, etc.)

If you simply need to change a few markers' information, skip to the [Manually updating individual markers from game assets](#manually-updating-individual-markers-from-game-assets) section.

### Updating entire marker categories from game assets

1. If a new update occurred, extract the new update as a Unity Project into `_ripped_unityproj/`.
    This can be achieved using a tool like https://github.com/AssetRipper/AssetRipper.

    The `_ripped_unityproj/` folder is intentionally ignored in `.gitignore`.
    You will need to create it yourself if it does not exist.

    > [!IMPORTANT]  
    > The script looks for `.unity` and `.asset` files with specific names and in specific locations.
    > All of these names and locations are specified in [`asset_paths.js`](./asset_paths.js) as globs or direct paths.
    >
    > Depending on how you extracted the new update, file names and paths may change.
    > Update [`asset_paths.js`](./asset_paths.js) as needed.

2. Delete all contents of folder `data_cache/`.

2. Run the command:
    ```bash
    npm run nodes
    ```

    This will extract data from the game assets, process it, and export it into the *main project's* [`src/data/....ts`](../src/data/) files.

    > [!NOTE]  
    > A best-effort attempt will be made to merge extracted data with existing data, where present. Some info will be left alone if present, such as marker names and descriptions, to avoid overwriting likely manually-written info.
    >
    > Placeholders will be inserted for required but non-extracted information, such as descriptions.
    >
    > Mappings from data's internally-extracted (or manufactured) identifiers to existing data's older identifiers can be found in
    > [`id_mappings/`](./id_mappings/).

    > [!TIP]  
    > You can optionally specify the following cli flags:
    > 
    > `--usecache <true|false|y|n|1|0>` (defaults to true):
    >
    > - Specifies whether to read from cache files located in `data_cache/`.
    >   If a cache file does not exist, it will be generated (unless `--exporttocache` flag is false).
    >
    >   > [!WARNING]  
    >   > When information in `_ripped_unityproj/` has changed,
    >   > make sure to either delete `data_cache/` directory (see step 2)
    >   > or to specify `--usecache false` for every category of markers,
    >   > so that any stale processed data will not be unintentionally used instead of new game asset data.
    >
    > `--exporttocache <true|false|y|n|1|0>` (defaults to true):
    >
    > - Specifies whether to export processed data to cache files located in `data_cache/`,
    >   for quicker processing of the same data in future script runs.
    >
    > `--only <comma-separated-list>` (defaults to all marker categories):
    >
    > - Alias of `--onlyextract` with same arguments.
    >
    > - Specifies which marker categories you want to process and export from the game files. By default, the script processes all of them. This flag is useful if you only want to process certain categories, or only want to process the unity .scene files the into `data_cache/assetsFileIdMapping` and avoid processing any markers and touching any of the main project's data files.
    >
    >   Categories are specified as a comma-separated or semicolon-separated list of one or more valid category types (for example: `--only gordos,gigiholograms,researchdrones`) or unambiguous substrings thereof (for example: `--only gordo,gigi,drone`). Valid category types can be found in [`src/nodes/process_node_locs.js`](./src/nodes/process_node_locs.js) in the `ExtractionTypes` list of strings.
    >
    >   ```bash
    >   # Example usage, to process only gigi holograms, research drones, teleporter lines and teleporter pads, and map nodes:
    >   npm run nodes -- --only gigi,drone,teleporter,mapnode
    >   ```
    >
    >   Two special category types exist: `assetsmapping` and `translationtables`.
    >   
    >   > [!NOTE]  
    >   > When only special category types are specified, the script will *avoid processing any marker categories*.
    >
    >   - `assetsmapping`:  
    >     The script will process the relevant unity .scene files
    >     (located as specified in `GLOBS_TO_INTERESTING_SCENES` in [`asset_paths.js`](./asset_paths.js))
    >     into `data_cache/assetsFileIdMapping`.
    >
    >     This behavior also happens anytime `assetsFileIdMapping` is required by the script
    >     elsewhere — i.e., when processing nearly any marker category —
    >     and `assetsFileIdMapping` is not already present or `--usecache` is false.
    >
    >   - `translationtables`:  
    >     The script will process all the relevant localization table .asset files 
    >     (located as specified in `L10N_TABLES_GLOBS` in [`asset_paths.js`](./asset_paths.js))
    >     into `data_cache/` (e.g., `CommStationL10nData.json`, `ResearchDroneL10nData.json`).
    >
    >     This behavior also happens anytime localization tables are required by the script elsewhere,
    >     and the required cache file is not already present or `--usecache` is false.

> [!IMPORTANT]  
> Not all information is automatically extracted from the game files! This includes but is not limited to:
> Treasure Pod contents, Gordo rewards, Gigi Holograms' conversations, marker descriptions, and more.
> If, after viewing the newly-extracted data in the dev server, some information is incorrect or missing,
> you likely need to **manually update it**.

> [!TIP]
> A few extra files are referenced for post-processing of data before export.
> Make changes to these files as needed.
>
> [`asset_paths.js`](./asset_paths.js):
>
> - Tells the scripts where to find extracted game data assets.
>   Useful for varied asset export locations / directory layouts after ripping assets from game.
>
> [`src/nodes/entries_export_filter.js`](./src/nodes/entries_export_filter.js):
>
> - Filters and transformations applied to extracted data.
>   Useful for excluding certain markers from being exported, applying modifications to positions, etc.
>
> [`id_mappings/....json`](./id_mappings/):
>
> - Mappings from data's internally-extracted (or manufactured) identifiers to existing data's older identifiers.
>   Useful for backwards compatibility.

### Manually updating individual markers

Make the desired edits yourself in the *main project's* [`src/data/....ts`](../src/data/) files.

### Updating Gigi Holograms' conversations

As mentioned above, the script unfortunately does not extract the dialogue from Gigi Holograms.
(If you can find how to do so, please contribute a fix for it!)

As a workaround, you must manually re-construct Gigi's conversations. You can either edit the main project's [`src/data/gigi_holograms.ts`](../src/data/gigi_holograms.ts) (if you are brave and possibly multilingual), or:

1. (*If necessary*) Regenerate `data_cache/CommStationL10nData.json`:
    ```bash
    npm run nodes -- --only translation
    ```

    > [!NOTE]  
    > You can skip this step if `data_cache/CommStationL10nData.json` is present
    > and no changes to the game's extracted assets data in `_ripped_unityproj/` have been made.

2. Go through the relevant Gigi dialogues in the game, look up each dialogue text and option button text in the CommStation localization table (`data_cache/CommStationL10nData.json`) and note its translation ID (the 18-digit key), and also note whenever Gigi's expression changes.

3. Edit [`gigi_manually_noted_conversations.js`](./gigi_manually_noted_conversations.js), inserting or updating conversations with a list of mappings from text entry to text entry or conversation options, and Gigi's expressions. Refer to the existing contents of the file for how to make the changes.

4. Run the `nodes` extraction script to process the manually-extracted conversation data into the *main project's* [`src/data/gigi_holograms.ts`](../src/data/gigi_holograms.ts):
    ```bash
    npm run nodes -- --only gigi
    ```
