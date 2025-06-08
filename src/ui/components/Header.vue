<template>
  <div>
    <div class="col-container announcement">
      This is the legacy version of ObjToSchematic. <br />
      It will not receive any more updates, bug fixes, or community support. Pull requests will be considered for merging.
    </div>
    <div class="col-container header-cols">
      <div class="col-container">
        <div class="col-item">
          <img class="logo" alt="Logo" :src="logoImage" />
        </div>
        <div class="col-item">
          <div class="row-container">
            <div class="row-item title">
              ObjToSchematic
            </div>
            <div class="row-item subtitle">
              {{ versionString }} • Minecraft {{ minecraftVersion }}
            </div>
          </div>
        </div>
      </div>
      <div class="toolbar-group">
        <button @click="openLink('github')" :title="loc('toolbar.open_github_repo')">GH</button>
        <button @click="openLink('issues')" :title="loc('toolbar.open_github_issues')">BUG</button>
        <button @click="openLink('discord')" :title="loc('toolbar.join_discord')">DISC</button>
        <button @click="openLink('kofi')" :title="loc('toolbar.kofi_donate')">KOFI</button>
      </div>
    </div>
    <div class="row-container header-cols">
      <div class="row-container" style="padding-top: 5px;" id="header-desc">
        {{ loc('description') }}
      </div>
      <div class="row-container privacy-disclaimer" style="padding-top: 5px;">
        This site may use cookies and similar tracking technologies (like web beacons) to access and store information about usage.
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { AppConfig } from '../../config'; // Assuming path is correct relative to this new file
import { LOC, Localiser, TLocalisedKey } from '../../localiser'; // Assuming path
import IMAGE_LOGO from '../../../res/static/icon.png'; // Assuming path

// A simplified version of ToolbarItemComponent's behavior for now
// In a real scenario, these icons would be SVGs or proper components
// For now, using text buttons as placeholders

export default defineComponent({
  name: 'Header',
  setup() {
    const versionString = ref('');
    const minecraftVersion = ref('');
    const logoImage = ref(IMAGE_LOGO);

    const loc = (key: string) => LOC(key as TLocalisedKey) || key;

    onMounted(() => {
      versionString.value = AppConfig.Get.getVersionString();
      minecraftVersion.value = AppConfig.Get.MINECRAFT_VERSION;
      // Refresh description on language change
      // EventManager.Get.add(EAppEvent.onLanguageChanged, () => {
      //   const descElement = document.getElementById('header-desc');
      //   if (descElement) {
      //     descElement.innerText = loc('description');
      //   }
      // });
    });

    const openLink = (type: 'github' | 'issues' | 'discord' | 'kofi') => {
      const urls = {
        github: 'https://github.com/LucasDower/ObjToSchematic',
        issues: 'https://github.com/LucasDower/ObjToSchematic/issues',
        discord: 'https://discord.gg/McS2VrBZPD',
        kofi: 'https://ko-fi.com/lucasdower',
      };
      window.open(urls[type]);
    };

    return {
      versionString,
      minecraftVersion,
      logoImage,
      loc,
      openLink,
    };
  },
});
</script>

<style scoped>
/* Styles from the original CSS might need to be scoped or globally available */
/* For now, assume some global styles are present */
.logo {
  /* Basic styling, adjust as needed */
  width: 50px;
  height: 50px;
}
.col-container {
  display: flex;
  flex-direction: column;
}
.row-container {
  display: flex;
  flex-direction: row;
}
.col-item, .row-item {
  padding: 5px;
}
.header-cols {
  justify-content: space-between;
  align-items: center;
}
.title {
  font-weight: bold;
  font-size: 1.5em;
}
.subtitle {
  font-size: 0.9em;
  color: grey;
}
.toolbar-group button {
  margin: 0 5px;
  /* Add icons or proper styling later */
}
.announcement {
  background-color: #f8d7da; /* Example color */
  color: #721c24; /* Example color */
  padding: 10px;
  text-align: center;
  border-bottom: 1px solid #f5c6cb; /* Example color */
}
.privacy-disclaimer {
    font-size: 0.8em;
    color: #6c757d;
}

/* Add other necessary styles from the original project */
</style>
