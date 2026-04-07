<template>
  <div class="image-uploader">
    <div v-if="label || helperText" class="field-header">
      <span v-if="label" class="field-label">{{ label }}</span>
      <span v-if="helperText" class="field-helper">{{ helperText }}</span>
    </div>

    <template v-if="multiple && allowUrlInput">
      <div class="source-row">
        <input
          v-model="urlInput"
          type="text"
          :placeholder="inputPlaceholder"
          :disabled="disabled || isUploading"
          @keydown.enter.prevent="addLinksFromInput"
        />
        <button
          type="button"
          class="button-secondary"
          :disabled="disabled || isUploading || !urlInput.trim()"
          @click="addLinksFromInput"
        >
          Add link
        </button>
      </div>
    </template>
    <template v-else-if="allowUrlInput">
      <input
        :value="singleValue"
        type="text"
        :placeholder="inputPlaceholder"
        :required="required"
        :disabled="disabled || isUploading"
        @input="updateSingleValue($event.target.value)"
      />
    </template>

    <div
      class="upload-dropzone"
      :class="{ 'is-dragover': isDragOver, 'is-disabled': disabled || isUploading }"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
    >
      <input
        ref="fileInput"
        class="file-input"
        type="file"
        accept="image/png, image/jpeg, image/webp"
        :multiple="multiple"
        @change="onFileChange"
      />
      <div class="dropzone-copy">
        <strong>{{ isUploading ? 'Uploading images...' : dropzoneTitle }}</strong>
        <span>{{ dropzoneHint }}</span>
      </div>
      <button
        type="button"
        class="button-secondary"
        :disabled="disabled || isUploading"
        @click="openFileDialog"
      >
        {{ multiple ? 'Select images' : 'Select image' }}
      </button>
    </div>

    <p v-if="errorMessage" class="feedback">{{ errorMessage }}</p>

    <div v-if="entries.length" class="image-preview">
      <div v-for="(entry, index) in entries" :key="`${entry}-${index}`" class="preview-item">
        <img :src="resolveMediaUrl(entry)" alt="Image preview" />
        <div class="preview-meta">
          <span class="preview-source">{{ entry }}</span>
          <button type="button" class="preview-remove" @click="removeImage(index)">Remove</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import api from '../services/api';
import { dedupeMediaSources, resolveMediaUrl, splitImageSources } from '../utils/media';

const props = defineProps({
  modelValue: {
    type: [String, Array],
    default: '',
  },
  uploadEndpoint: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    default: '',
  },
  helperText: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  allowUrlInput: {
    type: Boolean,
    default: true,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  maxFiles: {
    type: Number,
    default: 5,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'uploading-change']);

const fileInput = ref(null);
const urlInput = ref('');
const isDragOver = ref(false);
const isUploading = ref(false);
const errorMessage = ref('');

const entries = computed(() => {
  if (props.multiple) {
    return dedupeMediaSources(Array.isArray(props.modelValue) ? props.modelValue : splitImageSources(props.modelValue));
  }

  const currentValue = String(props.modelValue || '').trim();
  return currentValue ? [currentValue] : [];
});

const singleValue = computed(() => String(props.modelValue || ''));
const inputPlaceholder = computed(() =>
  props.placeholder || (props.multiple
    ? 'Paste image links, separated by commas or new lines'
    : 'Paste an image URL or uploaded path')
);
const dropzoneTitle = computed(() => (props.multiple ? 'Drag images here or choose from your device' : 'Drag an image here or choose from your device'));
const dropzoneHint = computed(() => (props.multiple ? `You can upload up to ${props.maxFiles} images.` : 'Upload one image from your computer.'));

const emitEntries = (nextEntries) => {
  if (props.multiple) {
    emit('update:modelValue', nextEntries);
    return;
  }

  emit('update:modelValue', nextEntries[0] || '');
};

const updateSingleValue = (value) => {
  errorMessage.value = '';
  emit('update:modelValue', value);
};

const addLinksFromInput = () => {
  const links = splitImageSources(urlInput.value);

  if (!links.length) {
    return;
  }

  const nextEntries = props.multiple
    ? dedupeMediaSources([...entries.value, ...links]).slice(0, props.maxFiles)
    : [links[0]];

  emitEntries(nextEntries);
  urlInput.value = '';
  errorMessage.value = '';
};

const openFileDialog = () => {
  if (props.disabled || isUploading.value) {
    return;
  }

  fileInput.value?.click();
};

const uploadFiles = async (selectedFiles) => {
  const remainingSlots = props.multiple ? Math.max(props.maxFiles - entries.value.length, 0) : 1;

  if (!remainingSlots) {
    errorMessage.value = `You can upload up to ${props.maxFiles} images.`;
    return;
  }

  const filesToUpload = selectedFiles.slice(0, remainingSlots);

  if (!filesToUpload.length) {
    return;
  }

  const formData = new FormData();
  filesToUpload.forEach((file) => formData.append('images', file));

  isUploading.value = true;
  emit('uploading-change', true);
  errorMessage.value = '';

  try {
    const { data } = await api.post(props.uploadEndpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const uploadedFiles = dedupeMediaSources(Array.isArray(data.files) ? data.files : data.file ? [data.file] : []);

    if (!uploadedFiles.length) {
      errorMessage.value = 'Upload finished but no image URL was returned.';
      return;
    }

    const nextEntries = props.multiple
      ? dedupeMediaSources([...entries.value, ...uploadedFiles]).slice(0, props.maxFiles)
      : [uploadedFiles[0]];

    emitEntries(nextEntries);
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'Unable to upload image.';
  } finally {
    isUploading.value = false;
    emit('uploading-change', false);
  }
};

const onDragOver = () => {
  if (props.disabled || isUploading.value) {
    return;
  }

  isDragOver.value = true;
};

const onDragLeave = () => {
  isDragOver.value = false;
};

const onDrop = async (event) => {
  if (props.disabled || isUploading.value) {
    return;
  }

  isDragOver.value = false;
  await uploadFiles(Array.from(event.dataTransfer.files || []));
};

const onFileChange = async (event) => {
  await uploadFiles(Array.from(event.target.files || []));
  event.target.value = '';
};

const removeImage = (index) => {
  emitEntries(entries.value.filter((_, entryIndex) => entryIndex !== index));
};
</script>

<style scoped>
.image-uploader {
  display: grid;
  gap: 0.8rem;
}

.field-header {
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.field-label {
  color: var(--text-muted);
  font-size: 0.92rem;
  font-weight: 700;
}

.field-helper {
  color: var(--text-muted);
  font-size: 0.82rem;
}

.source-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.7rem;
}

.upload-dropzone {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.upload-dropzone.is-dragover {
  border-color: rgba(249, 168, 38, 0.7);
  background: rgba(249, 168, 38, 0.08);
}

.upload-dropzone.is-disabled {
  opacity: 0.7;
}

.dropzone-copy {
  display: grid;
  gap: 0.25rem;
}

.dropzone-copy strong {
  font-size: 0.98rem;
}

.dropzone-copy span {
  color: var(--text-muted);
  font-size: 0.84rem;
}

.file-input {
  display: none;
}

.feedback {
  margin: 0;
  color: #ffc4c4;
  font-size: 0.9rem;
}

.image-preview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.8rem;
}

.preview-item {
  display: grid;
  gap: 0.7rem;
  padding: 0.75rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
}

.preview-item img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 12px;
}

.preview-meta {
  display: grid;
  gap: 0.55rem;
}

.preview-source {
  color: var(--text-muted);
  font-size: 0.82rem;
  word-break: break-all;
}

.preview-remove {
  width: fit-content;
}

@media (max-width: 720px) {
  .source-row,
  .upload-dropzone {
    grid-template-columns: 1fr;
    display: grid;
  }
}
</style>
