<template>
  <div class="login-container">
    <BoxContainer>
      <TopContainer>
        <BackDrop :class="{ 'expanded': isExpanded }" />
        <HeaderContainer>
          <HeaderText>{{ active === 'signin' ? 'Welcome' : 'Create' }}</HeaderText>
          <HeaderText>{{ active === 'signin' ? 'Back' : 'Account' }}</HeaderText>
          <SmallText>
            {{ active === 'signin' ? 'Please sign-in to continue!' : 'Please sign-up to continue!' }}
          </SmallText>
        </HeaderContainer>
      </TopContainer>
      <InnerContainer>
        <template v-if="active === 'signin'">
          <FormContainer>
            <Input type="email" placeholder="Email" />
            <Input type="password" placeholder="Password" />
            <Marginer direction="vertical" :margin="10" />
            <MutedLink href="#">Forgot your password?</MutedLink>
            <Marginer direction="vertical" :margin="10" />
            <SubmitButton type="submit">Sign In</SubmitButton>
            <Marginer direction="vertical" margin="1em" />
            <LineText>
              Don't have an account? <BoldLink href="#" @click="switchToSignup">Sign Up</BoldLink>
            </LineText>
          </FormContainer>
        </template>
        <template v-else>
          <FormContainer>
            <Input type="text" placeholder="Full Name" />
            <Input type="email" placeholder="Email" />
            <Input type="password" placeholder="Password" />
            <Input type="password" placeholder="Confirm Password" />
            <Marginer direction="vertical" :margin="10" />
            <SubmitButton type="submit">Sign Up</SubmitButton>
            <Marginer direction="vertical" margin="1em" />
            <LineText>
              Already have an account? <BoldLink href="#" @click="switchToSignin">Sign In</BoldLink>
            </LineText>
          </FormContainer>
        </template>
      </InnerContainer>
    </BoxContainer>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const active = ref('signin');
    const isExpanded = ref(false);

    const playExpandingAnimation = () => {
      isExpanded.value = true;
      setTimeout(() => {
        isExpanded.value = false;
      }, 2300);
    };

    const switchToSignup = () => {
      playExpandingAnimation();
      setTimeout(() => {
        active.value = "signup";
      }, 400);
    };

    const switchToSignin = () => {
      playExpandingAnimation();
      setTimeout(() => {
        active.value = "signin";
      }, 400);
    };

    return {
      active,
      isExpanded,
      switchToSignup,
      switchToSignin
    };
  }
};
</script>

<style scoped>
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #141414;
  color: white;
}

.BoxContainer {
  width: 280px;
  min-height: 550px;
  display: flex;
  flex-direction: column;
  border-radius: 19px;
  background-color: #fff;
  box-shadow: 0 0 2px rgba(15, 15, 15, 0.28);
  position: relative;
  overflow: hidden;
}

.TopContainer {
  width: 100%;
  height: 250px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0 1.8em;
  padding-bottom: 5em;
}

.BackDrop {
  position: absolute;
  width: 160%;
  height: 550px;
  display: flex;
  flex-direction: column;
  border-radius: 50%;
  top: -290px;
  left: -70px;
  transform: rotate(60deg);
  background: linear-gradient(
    58deg, rgba(243,172,18,1) 20%, rgba(241,196,15,1) 100%
  );
  transition: all 2.3s ease-in-out;
}

.BackDrop.expanded {
  width: 233%;
  height: 1050px;
  border-radius: 20%;
}

.FormContainer {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.MutedLink {
  font-size: 12px;
  color: rgba(200, 200, 200, 0.8);
  font-weight: 500;
  text-decoration: none;
  border-bottom: 1px dashed rgba(200, 200, 200, 0.8);
}

.BoldLink {
  font-size: 12px;
  color: rgba(241,196,15,1);
  font-weight: 500;
  text-decoration: none;
  border-bottom: 1px dashed rgba(241,196,15,1);
}

.Input {
  width: 100%;
  height: 42px;
  outline: none;
  border: 1px solid rgba(200, 200, 200, 0.3);
  border-radius: 5px;
  padding: 0px 10px;
  transition: all 200ms ease-in-out;
  margin-bottom: 5px;
}

.Input::placeholder {
  color: rgba(200, 200, 200, 1);
}

.Input:focus {
  outline: none;
  border-bottom: 1px solid rgba(241, 196, 15, 1);
}

.SubmitButton {
  width: 100%;
  max-width: 150px;
  padding: 10px;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: 100px;
  cursor: pointer;
  transition: all 240ms ease-in-out;
  background: linear-gradient(
    58deg, rgba(243,172,18,1) 20%, rgba(241,196,15,1) 100%
  );
}

.SubmitButton:hover {
  filter: brightness(1.03);
}

.LineText {
  font-size: 12px;
  color: rgba(200, 200, 200, 0.8);
  font-weight: 500;
}

.HeaderContainer {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.HeaderText {
  font-size: 30px;
  font-weight: 600;
  line-height: 1.24;
  color: #fff;
  z-index: 10;
}

.SmallText {
  font-size: 11px;
  font-weight: 500;
  color: #fff;
  margin-top: 7px;
  z-index: 10;
}

.InnerContainer {
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 0px 20px;
}
</style>