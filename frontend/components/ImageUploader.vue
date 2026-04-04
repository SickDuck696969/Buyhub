<template>
  <div
    class="image-uploader"
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
    :class="{ 'is-dragover': isDragOver }"
  >
    <input
      type="file"
      multiple
      @change="onFileChange"
      accept="image/png, image/jpeg, image/webp"
      ref="fileInput"
      style="display: none"
    />
    <div v-if="!images.length">
      <p>Drag and drop images here, or click to select files.</p>
      <button @click="openFileDialog">Select Files</button>
    </div>
    <div v-else class="image-preview">
      <div v-for="(image, index) in images" :key="index" class="preview-item">
        <img :src="image.url" :alt="image.file.name" />
        <button @click="removeImage(index)">Remove</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['update:modelValue']);
const fileInput = ref(null);
const isDragOver = ref(false);
const images = ref([]);

const onDragOver = (event) => {
  isDragOver.value = true;
};

const onDragLeave = (event) => {
  isDragOver.value = false;
};

const onDrop = (event) => {
  isDragOver.value = false;
  handleFiles(event.dataTransfer.files);
};

const onFileChange = (event) => {
  handleFiles(event.target.files);
};

const handleFiles = (files) => {
  for (const file of files) {
    if (images.value.length < 5 && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        images.value.push({ url: e.target.result, file });
        emit('update:modelValue', images.value.map(i => i.file));
      };
      reader.readAsDataURL(file);
    }
  }
};

const openFileDialog = () => {
  fileInput.value.click();
};

const removeImage = (index) => {
  images.value.splice(index, 1);
  emit('update:modelValue', images.value.map(i => i.file));
};
</script>

<style scoped>
.image-uploader {
  border: 2px dashed #ccc;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.2s;
}
.image-uploader.is-dragover {
  background-color: #f0f0f0;
}
.image-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.preview-item {
  position: relative;
}
.preview-item img {
  max-width: 150px;
  max-height: 150px;
}
.preview-item button {
    position: absolute;
    top: 5px;
    right: 5px;
    background: red;
    color: white;
    border: none;
    cursor: pointer;
}
</style>
