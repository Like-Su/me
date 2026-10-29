import React, { useState } from 'react';
import { Button, Card, Col, Form, Input, Row, Typography, message } from 'antd';
import { useLocation, useNavigate } from '@umijs/max';

interface LoginValues {
  username: string;
  password: string;
}

/** 演示账号，接入真实接口后删掉 */
const DEMO_USER = 'admin';
const DEMO_PASSWORD = '123456';

export default function Page() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: LoginValues) => {
    setLoading(true);
    try {
      // TODO: 换成真实登录接口，把后端返回的 JWT 存下来
      // const { token } = await request.post('/api/login', { data: values });
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (values.username !== DEMO_USER || values.password !== DEMO_PASSWORD) {
        message.error('用户名或密码错误');
        return;
      }

      localStorage.setItem('access_token', `mock-token-${Date.now()}`);
      message.success('登录成功');

      // 被守卫拦下来时回跳原页面，否则回首页
      const from = (location.state as { from?: { pathname?: string } } | null)?.from
        ?.pathname;
      navigate(from && from !== '/login' ? from : '/home', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row justify="center" align="middle" style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Col xs={22} sm={16} md={12} lg={8} xl={6}>
        <Card style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
          <Typography.Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
            RBAC 管理系统
          </Typography.Title>

          <Form<LoginValues>
            name="login"
            layout="vertical"
            size="large"
            autoComplete="off"
            onFinish={onFinish}
          >
            <Form.Item
              label="用户名"
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input placeholder="请输入用户名" />
            </Form.Item>

            <Form.Item
              label="密码"
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 12 }}>
              <Button type="primary" htmlType="submit" block loading={loading}>
                登录
              </Button>
            </Form.Item>
          </Form>

          <Typography.Text type="secondary">
            演示账号：{DEMO_USER} / {DEMO_PASSWORD}
          </Typography.Text>
        </Card>
      </Col>
    </Row>
  );
}
