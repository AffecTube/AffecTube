# AffecTube
_AffectTube_ is an extension for the Chrome web browser that enables annotating video footage directly on the YouTube platform. Together with [StorageAPI](https://github.com/AffecTube/StorageAPI) and [DatasetCreator](https://github.com/AffecTube/DatasetCreator) it facilitates a low-resource environment for crowdsourcing anntation process. 

![image](https://github.com/AffecTube/AffecTube/assets/2039195/f745568e-837f-4234-a18d-d42f3995da62)

## Configuration

The extension is distributed to annotators in source code form. Before sharing the archive with annotators, modifications to the source code must be made, i.e., defining the server to which the annotated date will be sent and the list of labels. 

Both changes are made in the `src/inject/inject.js` file. 

### StorageAPI

If you want to use the on-premises [StorageAPI](https://github.com/AffecTube/StorageAPI), its address and optional port number should be entered in the 3rd line:
```js
    this.urlApi = "http[s]://ADDRESS[:PORT]/LabelingEmotionsDatabase/";
```

### GitHub storage

If you are using GitHub to receive data from an extension, you should place the appropriate data in the constructor of the `DataUploaderGithub` class (line 34). You should provide the address of the server and the tokens that were generated in the GitHub repository. More informaction about GitHub API can be found in [documentation](https://docs.github.com/en/rest/overview/about-githubs-apis).

It is also necessary to change the `dataUploader` in line 144 from `DataUploaderAPI` to `DataUploaderGithub`.

### Labels definition
The list of available labels is defined on line 137. They are customizable and can be tailored to the needs of the study in question.
```js
  let emotions = ["happiness", "sadness", "disgust", "fear", "surprise", "anger", "confusion"];
```

After making these changes, you can share the extension with annotators. 

![image](https://github.com/AffecTube/AffecTube/assets/2039195/6baad362-c42e-460c-b086-713b0e74252b)


## Installation

1. Open _Google Chrome_ browser, then navigate to the following address:

![image](https://github.com/AffecTube/AffecTube/assets/39652146/1954163c-d6f0-4875-84e9-9a8545d746f3)

2. Enable developer mode in the upper right corner of the screen.

![image](https://github.com/AffecTube/AffecTube/assets/39652146/c37088d4-9309-4da8-9df6-33cb9ef0061f)

3. Select the "Load unpacked" option available in the upper left corner of the screen, then select the previously unpacked _AffecTube_ extension.

![image](https://github.com/AffecTube/AffecTube/assets/39652146/f010a76b-0db3-4cf5-a08d-6581997b6699)

4. Extension should be installed and ready to use.

![image](https://github.com/AffecTube/AffecTube/assets/39652146/da3c4761-7024-4d0e-b55b-71fb785525a1)


## Manual

The main window of the extension looks as shown below:

![image](https://github.com/AffecTube/AffecTube/assets/39652146/1dfb33d3-4b91-4cf6-9379-826d0035cd15)

- After pressing the **_Update_** button, the username will be updated.

- After pressing the **_Submit_** button, all annotations are sent to the server, and the cache is cleared.


After opening a video on the _YouTube_ platform, additional buttons will be added to mark emotions in the video. You can mark the moment when a particular emotion starts by clicking on the corresponding button.

![3](https://github.com/AffecTube/AffecTube/assets/39652146/c1f4a01d-e99b-499d-bfd3-9c1de5c13a4c)

After selecting any emotion, a **_Stop_** button will appear to mark the moment when the emotion ends.

![2](https://github.com/AffecTube/AffecTube/assets/39652146/e9378344-89ff-4671-91ed-84cb71d5ea64)

The labeled emotions are shown in the table.

![1](https://github.com/AffecTube/AffecTube/assets/39652146/6db235fa-b3d7-4ced-8a5f-e114d4f2a37b)

- Pressing on the time window (input filed) sets the video playback at the specified moment.

- After pressing the icon ![unnamed4](https://github.com/AffecTube/AffecTube/assets/39652146/12282370-4111-4c44-88d7-f34494638ae0) , the time is updated to the video playback time.

- After pressing the icon ![unnamed3](https://github.com/AffecTube/AffecTube/assets/39652146/0f6e2956-cdcf-4a1c-b70a-fcd084aa1ccf) , the row is removed from the table.
