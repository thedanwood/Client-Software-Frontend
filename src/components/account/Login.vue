<template>
  <div class="login-container">
    <h1>Login</h1>
    <hr />
    <Input label="Username" :value="username" @input="(val) => (username = val)" place="Enter your username" />
    <Password
      class="mt-3"
      label="Password"
      :value="password"
      @input="(val) => (password = val)"
      place="Enter your password"
    />
    <AlertBox v-if="errorMessage" class="alert-danger mt-3" :text="errorMessage"></AlertBox>
    <Button
      class="btn-green mt-4 p-3"
      value="Login"
      :disabled="isLoading"
      :iconBefore="['fas', 'long-arrow-alt-right']"
      @click="onLogin()"
    />
  </div>
</template>

<script lang="ts" setup>
import { Input, Button, AlertBox } from "../../components/shared";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import Password from "../shared/Password.vue";
import { useHaulageSystemStore } from "../../stores/haulageSystemStore";
import { getAuthenticatedClient } from "../../core/functions/HaulageSystemClient";
import { storeToRefs } from "pinia";
import { AuthClient, LoginCommand } from "../../api/haulage-system";
import { RouterNames } from "../../core/enums/RouterNames";
import { useGlobalStore } from "../../stores/globalStore";

const username = ref("");
const password = ref("");
const globalStore = useGlobalStore();
const { errorMessage } = storeToRefs(globalStore);
const store = useHaulageSystemStore();
const { isLoading } = storeToRefs(store);
const router = useRouter();

async function onLogin() {
  globalStore.setErrorMessage(null);
  store.setIsLoading(true);
  await getAuthenticatedClient(AuthClient)
    .login({ username: username.value, password: password.value } as LoginCommand)
    .then(async (response) => {
      globalStore.getInitialAppData();
      globalStore.setIsAuthenticated(true);
      router.push({ name: RouterNames.AddQuoteSelection });
    })
    .catch((ex) => {
      globalStore.handleBackendError(ex);
    });
  store.setIsLoading(false);
}

onMounted(() => {
  store.setErrorMessage(null);
});
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
}
</style>
