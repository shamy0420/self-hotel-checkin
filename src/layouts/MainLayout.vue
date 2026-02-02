<template>
  <q-layout view="hHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>
          Hotel Checkin
        </q-toolbar-title>

        <q-btn flat round dense icon="info" @click="showInfo = true" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Info Dialog -->
    <q-dialog v-model="showInfo">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Hotel Check-In System</div>
        </q-card-section>
        <q-card-section>
          <p>This is a self-check-in system for hotels with Firebase integration.</p>
          <p class="q-mt-md"><strong>Features:</strong></p>
          <ul>
            <li>Online room booking</li>
            <li>Unique verification codes</li>
            <li>ESP32/Raspberry Pi integration</li>
          </ul>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'

const showInfo = ref(false)
</script>
