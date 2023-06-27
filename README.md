# AffecTube
_AffectTube_ is an extension for the Chrome web browser that enables annotating video footage directly on the YouTube platform. Together with [StorageAPI](https://github.com/AffecTube/StorageAPI) and [DatasetCreator](https://github.com/AffecTube/DatasetCreator) it facilitates a low-resource environment for crowdsourcing anntation process. 

![image](https://github.com/AffecTube/AffecTube/assets/2039195/f745568e-837f-4234-a18d-d42f3995da62)

The extension is distributed to annotators in source code form. Before uploading the archive, modifications must be made to the source code, i.e. defining the StorageAPI address and the list of labels. 

Both changes are made in the `src/inject/inject.js` file. The StorageAPI address should be in the 3rd line:
```js
    this.urlApi = "https://labelling-api.affectivese.org/LabelingEmotionsDatabase/";
```

On the other hand, the list of available labels is defined on line 90:
```js
  let emotions = ["happiness", "sadness", "disgust", "fear", "surprise", "anger", "confusion"];
```

After making these changes, you can share the extension with annotators. 

![image](https://github.com/AffecTube/AffecTube/assets/2039195/6baad362-c42e-460c-b086-713b0e74252b)
